      $(document).ready(function(){
        $(document).on('click', '#navbarManageReviews', function(e){
        $.ajax({
        url:'/reviews',
        type:'GET',
        dataType:'json',
        success: function(res){
          $('#userReviews').empty();
          $('#manageReviewsErrors').empty();
          console.log('got to manage reviews ajax');
          if(res.message=='error'){
            var $errorText = $('<p></p>').text("There was an error loading your reviews. Please try again");
            $('#userReviews').append($errorText);
            return;
          }
          if(res.message=='no reviews'){
            var $noReviewText = $('<p></p>').text("You haven't written any reviews");
            $('#userReviews').append($noReviewText);
            return;

          }
          if(res.message=='success'){
            var reviews = res.reviews;
            var thisTemplate = $('#myReviewsTemplate').html();

            var compiledTemplate = Handlebars.compile(thisTemplate);
            console.log("got past compiledTemplate");
            reviews.forEach(function(review){
              service.getDetails({placeId:review.restaurantId}, function(place, status){
                if(status===google.maps.places.PlacesServiceStatus.OK){
                  var modifiedReview = {};
                  modifiedReview.content = review.content;
                  modifiedReview.restaurantName = place.name;
                  modifiedReview._id = review._id;
                  // console.log(review.restaurantName);
                  // console.log(place.name);
                  console.log(modifiedReview);
                  var output = compiledTemplate(modifiedReview);
                  $('#userReviews').append(output);

                }

              });
              
            });


          }

        }
      });

      });

      });
      