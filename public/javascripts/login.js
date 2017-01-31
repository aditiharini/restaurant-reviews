$(document).ready(function(){
  LoadProfile();
  $('#loginButton').click(function(){
            $('#loginAlert').empty();
            $('#loginAlert').hide();
            console.log('login click event triggered');
            var username=$('#loginUsername').val();
            var password = $('#loginPassword').val();
            $('#loginUsername').val('');
            $('#loginPassword').val('');
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
                  // $('#loginModal').modal('hide');
                  // $('#menu').show(); 
                  // $('#navbarList').append('<div class="dropdown" id="menu"> <button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">Menu <span class="caret"></span></button> <ul class="dropdown-menu"> <li id = "navbarAbout"><a href = "#" data-toggle = "modal" data-target = "#about"> About </a></li> <li id="navbarProfile"> <a href="#" data-toggle="modal" data-target = "#profile" onclick = "LoadProfile()"> Profile </a></li> <li id = "navbarLogout"> <a  href="/logout"> Log Out </a> </li></ul></div>');
                  // $('#navbarAbout').hide(); 
                  // $('#navbarLogin').hide();
                  LoadProfile();



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
            $('#loginUsername').val('');
            $('#loginPassword').val('');

          });

          $('.close').click(function(){
            $('#loginUsername').val('');
            $('#loginPassword').val('');
            $('#signupName').val('');
            $('#signupUsername').val('');
            $('#signupPassword').val('');
            $('#reviewContent').val('');
            $('input:radio[name=rating]:checked').prop('checked', false);


          });

          $('#loginPassword').keypress(function(e){
          if(e.keyCode==13){
            $('#loginButton').click();
          }
        });

});

