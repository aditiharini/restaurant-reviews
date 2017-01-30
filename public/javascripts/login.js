$(document).ready(function(){
  $('#loginButton').click(function(){
            $('#loginAlert').empty();
            $('#loginAlert').hide();
            console.log('login click event triggered');
            var username=$('#loginUsername').val();
            var password = $('#loginPassword').val();
            $.ajax({
              type:'GET',
              url:'/login',
              data:{username:username, password:password},
              dataType:'json',
              contentType: 'application/json',
              success:function(res){
                console.log('got to login ajax');
                console.log(res.message);
                if(res.message=='success'){
                  $('#loginModal').modal('hide');
                  $('#navbarLogin').hide();
                  $('#navbarList').append('<li> <a href="#" data-toggle="modal" data-target = "#profile" id="navbarProfile"> Profile </a></li>');
                  $('#navbarList').append('<li> <a href="#" data-toggle="modal" data-target = "#manageReviewsModal" id="navbarManageReviews"> Manage Reviews </a></li>');
                
                  $('#navbarList').append('<li> <a id = "navbarLogout" href="/logout"> Log Out </a> </li>');



                }
                // var alertHtml = '<div class="alert alert-danger">' + 
                // '<strong>Error!</strong>' + res.message +
                // '</div>';
                // $('loginModalBody').append(alertHtml);
                else{
                  $('#loginAlert').append('<p>' + res.message + '</p>');
                  $('#loginAlert').show();

                }
              
              }

          });
        });
          $('#loginToRegister').click(function(){
            $('#loginModal').modal('hide');
            $('#signupModal').modal('show');
          });

});

