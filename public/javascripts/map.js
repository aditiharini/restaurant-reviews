      var map;
      var infowindow;
      var service;
      var markers = [];
      var currentRestaurantId;
      var bounds;
      var idToInfo = {};
      var currentSubmitReviewAjax;
      var currentViewReviewsAjax;

      function gotPosition(position){
        var userLocation = {lat:position.coords.latitude, lng:position.coords.longitude};
        console.log(position.coords.latitude);
        console.log(position.coords.longitude);
        map = new google.maps.Map(document.getElementById('map'), {
          center: userLocation,
          zoom: 15
        });
        google.maps.event.addDomListener(window, "resize", function() {
         var center = map.getCenter();
         google.maps.event.trigger(map, "resize");
         map.setCenter(center); 
        });

      }
      function noPosition(err){
        console.log(err);
        var standardLocation = {lat: 42.7654, lng: -71.4676};
        map = new google.maps.Map(document.getElementById('map'), {
          center: standardLocation,
          zoom: 15
        });
        google.maps.event.addDomListener(window, "resize", function() {
         var center = map.getCenter();
         google.maps.event.trigger(map, "resize");
         map.setCenter(center); 
        });
      }


      function initMap() {
        // this is taking a really long time to load
        // navigator.geolocation.getCurrentPosition(gotPosition, noPosition);
        var standardLocation = {lat: 42.3589805, lng: -71.0950021};
        map = new google.maps.Map(document.getElementById('map'), {
          center: standardLocation,
          zoom: 15
        });
        google.maps.event.addDomListener(window, "resize", function() {
         var center = map.getCenter();
         google.maps.event.trigger(map, "resize");
         map.setCenter(center); 
        });


        infowindow = new google.maps.InfoWindow();
        service = new google.maps.places.PlacesService(map);
      }


      function search(){
        console.log('got here');
          service.textSearch({
          // location: map.getCenter(),
          // radius: 500,
          type: ['restaurant'],
          query:$('#pac-input').val(),
        }, callback);
      }

      function query(result){
        deleteMarkers();
        $('#viewReviews').hide();
        $.ajax({
          type:'POST',
          url:'/',
          data:{query:true, id:result.place_id},
          dataType:'json',
          success: function(res){
            console.log("got to ajax request");
            if(res.error){
              console.log(error);
              // createMarker(results[i], id);
              // return;

            }
            else if(res.restaurant){
              console.log(result);
              createMarker(result, true);
            }
            else{
              console.log(result);
              createMarker(result, false);
            }


          }
          // query the database to see if this place has reviews... set infowindow accordingly

        });

      }

    

      function callback(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          bounds = new google.maps.LatLngBounds();
          addButtonListeners();
          for (var i = 0; i < results.length; i++) {
            // console.log(results[i]);
            var id = results[i].place_id;
            // move create marker to ajax callback
            query(results[i]);


       
          }
        }
      }

      function createMarker(place, restaurantExists) {
        var placeLoc = place.geometry.location;
        var marker = new google.maps.Marker({
          map: map,
          position: place.geometry.location
        });
        markers.push(marker);
        // idToInfo[place.place_id] = place.name;
        console.log(place.geometry.location.lat());
        //something weird happening here
        bounds.extend(new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng()));
        map.fitBounds(bounds);
        // map.fitBounds(bounds);

        google.maps.event.addListener(marker, 'click', function() {
          // if the place exists, have reviews button in infowindow
          // if it doesn't exist, have make review button
          // check if user is logged in before anything else
          var existsHtml = '<div id="content">' +
      '<p>' + place.name + '</p>'+ 
      '<p>' + place.formatted_address + '</p>'+
      '<button class = "btn btn-success viewReviews" id = ' + place.place_id + '>' + 'View Reviews' + '</button>'+
      '<button class = "btn btn-primary createReview" id = ' + place.place_id + '>' + 'Write a Review</button>'+
      '</div>';

          var notExistsHtml = '<div id="content">' +
      '<p>' + place.name + '</p>'+ 
      '<p>' + place.formatted_address + '</p>' +
      '<p id="noReviewsIndicator"> No existing reviews </p>' + 
      '<button class = "btn btn-success viewReviews" style="display:none;" id = ' + place.place_id + '>' + 'View Reviews</button>'+
      '<button class = "btn btn-primary createReview"  id = ' + place.place_id + '>' + 'Write a Review</button>'+
      '</div>';
          if(restaurantExists){
            infowindow.setContent(existsHtml);
          }
          else{
            infowindow.setContent(notExistsHtml);
          }
          
          infowindow.open(map, this);
        });
      }

    function addButtonListeners(){
      $('#map').on('click','.createReview', function(e){
          console.log($(this).attr('id'));
          var id = $(this).attr('id');
          console.log(id);
          currentRestaurantId = id;
          $('#submitReview').attr('id',id);
          $('#writeAReview').modal('show');
      });
      $('#map').on('click', '.viewReviews', function(e){
        console.log($(this).attr('id'));
        var id = $(this).attr('id');
        currentRestaurantId = id;
        if(currentViewReviewsAjax){
          currentViewReviewsAjax.abort();
          console.log("got to view reviews ajax abort");
        }
        currentViewReviewsAjax = $.ajax({
          type:'POST',
          data:{viewReview:true, id:currentRestaurantId},
          dataType:'json',
          success:function(res){
            console.log('got to ajax view reviews');
            $('#viewReviews').empty();
            
            var reviews = res.reviews;
            var template = $('#reviewTemplate').html();
            var compiledTemplate = Handlebars.compile(template);
            if(reviews.length>0){
              console.log(reviews);
              var counter = reviews.length;
              reviews.forEach(function(review, index){
                var output = compiledTemplate(review);
                $('#viewReviews').append(output);
                setRating(review.rating);
                setTimeout(function(){
                  counter--;
                  if(counter===0){
                    $('#viewReviews').show();
                  }
                }, 100);
              });
            }
            else{
              var $div = $('<div></div>', {id:"noReviews"});
              var $text = $('<p></p>').text("No relevant reviews");
              var $button = $('<button></button>', {id:"loadAllReviews", class:"btn btn-primary"}).text("Load all reviews");
              $button.click(function(){
                $('#viewReviews').empty();
                if(currentViewReviewsAjax){
                  currentViewReviewsAjax.abort();
                }
                currentViewReviewsAjax = $.ajax({
                  url:'/',
                  type:'POST',
                  data:{viewAllReviews:true, id:currentRestaurantId},
                  dataType:'json',
                  success:function(newRes){
                    var allReviews = newRes.reviews;
                    console.log(allReviews);
                    allReviews.forEach(function(thisReview, thisIndex){
                      var newOutput = compiledTemplate(thisReview);
                      $('#viewReviews').append(newOutput);
                      setRating(thisReview.rating);
                      if(thisIndex==allReviews.length-1){
                        $('#viewReviews').show();
                      }
                    });
                    
                  }

              });

              });
              $div.append($text, $button);
              $('#viewReviews').append($div);
              $('#viewReviews').show();
            }
          }

        });

      });
      // need to check if user is logged in
      $('#submitReview').click(function(){
        $('#reviewContent').val('');
        var id = $(this).attr('id');
        console.log(id);
        var content = $('#reviewContent').val();
        var rating;
          if($('#star1').is(':checked')){
            rating=1;
          }
          if($('#star2').is(':checked')){
            rating=2;
          }
          if($('#star3').is(':checked')){
            rating=3;
          }
          if($('#star4').is(':checked')){
            rating=4;
          }
          if($('#star5').is(':checked')){
            rating=5;
          }
        if(currentSubmitReviewAjax){
          currentSubmitReviewAjax.abort();
        }
        currentSubmitReviewAjax = $.ajax({
          type:'POST',
          url:'/',
          data:{isReview:true, id: currentRestaurantId, content:content, rating:rating},
          dataType:'json',
          success:function(res){
            console.log('got to ajax request');
            console.log(res.message);
            if(!res.loggedIn){
              $('#writeAReview').modal('hide'); 
              $('#loginModal').modal('show');
              return;
            }
            if(res.message=='success'){
              $('#reviewForm').hide();
              $('#writeAReview').modal('hide');
              $('.viewReviews, #' + currentRestaurantId).show();
              $('#noReviewsIndicator').hide();
              return;
            }
            if(res.message=='error'){
              alert("please try again");
              return;
            }

          }

        });

      });
    }

      function setMapOnAll(map) {
        for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(map);
        }
      }

      function clearMarkers() {
        setMapOnAll(null);
      }

      function deleteMarkers() {
        clearMarkers();
        markers = [];
      }

      function setRating(rating){
        console.log('got to set rating');
        $stars = $('.star-rating .fa');
        $stars.each(function(){
          if(parseInt($(this).data('rating'))<=parseInt(rating)){
            $(this).removeClass('fa-star-o').addClass('fa-star');
          }

        });

      }



      