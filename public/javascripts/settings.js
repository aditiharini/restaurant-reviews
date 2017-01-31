function LoadProfile() {
        $('#agecityalert').empty();
        $('#agecityalert').hide();
        $.ajax({
          type: 'POST', 
          url: '/settings', 
          data: {id: "ethnicity"}, 
          dataType: 'json', 
          success: function(data) {
            if (res.message ==='success') {
               var user = data.data; 
              var ethnicity = user.ethnicity; 
              var city = user.location.city; 
              var state = user.location.state; 
              var age = user.age; 
              $("#Ethnic").val(ethnicity); 
              $("#State").val(state); 
              $("#city").val(city); 
              $("#age").val(age); 
              if (user.gender == "female") {
                  document.getElementById("male").checked = false; 
                  document.getElementById("female").checked = true; 
                }
                if (user.gender == "male") {
                  document.getElementById("male").checked = true; 
                  document.getElementById("female").checked = false; 
                }
                $("#vegetarian").prop('checked', user.dietaryRestrictions.vegetarian); 
                $("#vegan").prop('checked', user.dietaryRestrictions.vegan); 
                $("#kosher").prop('checked', user.dietaryRestrictions.kosher); 
                $("#halal").prop('checked', user.dietaryRestrictions.halal);
                $("#nutAllergies").prop('checked', user.dietaryRestrictions.nutAllergies); 
            } else {
              $('#agecityalert').append('<p>' + res.message + '</p>');
              $('#agecityalert').show();
            }
           
          }
        });
        
      }
      
      function save() {
        $('#agecityalert').empty();
        $('#agecityalert').hide();
        $.ajax({
          type: 'POST', 
          url: '/settings', 
          data: {
            id: "buttoninput", 
            state: $("#State option:selected").text(),  
            city: $("#city").val(), 
            age: $("#age").val(),
            gender: $("input:radio[name=gender]:checked").val(),
            ethnicity: $("#Ethnic option:selected").text(),
            vegetarian: document.getElementById("vegetarian").checked,
            vegan: document.getElementById("vegan").checked,
            kosher: document.getElementById("kosher").checked,
            halal: document.getElementById("halal").checked,
            nutAllergies: document.getElementById("nutAllergies").checked
          }, 
          dataType: 'json', 
          success: function(data) {
            if (data.message ==='success') {
              $('#profile').modal('hide');
              var user = data.data; 
              $("#State").val(user.location.state); 
                $("#age").val(user.age); 
                $("#city").val(user.location.city); 
                if (user.gender == "female") {
                  document.getElementById("male").checked = false; 
                  document.getElementById("female").checked = true; 
                }
                if (user.gender == "male") {
                  document.getElementById("male").checked = true; 
                  document.getElementById("female").checked = false; 
                }
                $("#Ethnic").val(user.ethnicity); 
                if (user.dietaryRestrictions.halal == "false") {
                  document.getElementById("halal").checked = false; 
                } else if (user.dietaryRestrictions.halal == "true") {
                  document.getElementById("halal").checked = true; 
                }
                
                if (user.dietaryRestrictions.vegan == "false") {
                  document.getElementById("vegan").checked = false; 
                } else if (user.dietaryRestrictions.vegan == "true"){
                  document.getElementById("vegan").checked = true; 
                }
                if (user.dietaryRestrictions.vegetarian == "false") {
                  document.getElementById("vegetarian").checked = false; 
                } else if (user.dietaryRestrictions.vegetarian == "true") {
                  document.getElementById("vegetarian").checked = true; 
                }
                if (user.dietaryRestrictions.nutAllergies == "false") {
                  document.getElementById("nutAllergies").checked = false; 
                } else if (user.dietaryRestrictions.nutAllergies == "true"){
                  document.getElementById("nutAllergies").checked = true; 
                }
                if (user.dietaryRestrictions.kosher == "false") {
                  document.getElementById("kosher").checked = false; 
                } else if (user.dietaryRestrictions.kosher == "true") {
                  document.getElementById("kosher").checked = true; 
                }
              } else {
                $('#agecityalert').append('<p>' + data.message + '</p>');
                $('#agecityalert').show();
              }
            
          }
        });
      }