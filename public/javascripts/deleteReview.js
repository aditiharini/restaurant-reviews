$(document).ready(function(){
  $(document).on('click', '.delete', function(e){
          var id = this.id;
          $(".confirmDeleteButton").attr("id", id);
          $('#manageReviewsErrors').empty();
          $('#manageReviewsModal').modal('hide');
          $('#confirmDeleteModal').modal('show');

  });

  $(".confirmDeleteButton").click(function(){
    var id = this.id;
    $('#confirmDeleteModal').modal('hide');
    $.ajax({
            type:'POST',
            url:'/reviews',
            data:{action:'delete', id:id},
            dataType:'json',
            success:function(res){
              console.log('got here');
              if(res.message=='success'){
                $('div#' + id + '.myReview').remove();
                $('#manageReviewsModal').modal('show');
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
