          
$(document).ready(function(){
  $('#signupSubmit').click(function(){
              $('#signupAlert').empty();
              $('#signupAlert').hide();
              var name = $('#signupName').val();
              var username = $('#signupUsername').val();
              var password = $('#signupPassword').val();
              $('#signupName').val('');
              $('#signupUsername').val('');
              $('#signupPassword').val('');
              $.ajax({
                type:'POST',
                url: '/signup',
                data: {name:name, username:username, password:password},
                dataType:'json',
                success:function(res){
                  console.log('got to sign in ajax');
                  console.log(res.message);
                  if(res.message=='success'){
                    $('#signupModal').modal('hide');
                    $('#loginModal').modal('show');
                  }
                  else{
                    $('#signupAlert').append('<p>' + res.message + '</p>');
                    $('#signupAlert').show();
                  }
                }

              });
          });

});
          