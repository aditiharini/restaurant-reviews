$(document).ready(function(){
  $(document).on('click', '.delete', function(e){
          $('#manageReviewsErrors').empty();
          var id = this.id;
          $.ajax({
            type:'POST',
            url:'/reviews',
            data:{action:'delete', id:id},
            dataType:'json',
            success:function(res){
              console.log('got here');
              if(res.message=='success'){
                $('div#' + id + '.myReview').remove();
              }
              else{
                var $text = $('<p></p>').text("Error deleting review");
                $("manageReviewsErrors").append($text);
                $("manageReviewsErrors").show();
                console.log(error);
              }

            }

          });

        });

});
