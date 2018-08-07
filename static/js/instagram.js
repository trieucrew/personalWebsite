function loadIGphotos(count, container){
  let access_token = "3323848341.8c16ec5.5142d379dcf34c05bfe8d440a5856ed0";
  $.ajax({
    type: "GET",
    dataType: "jsonp",
    url: "https://api.instagram.com/v1/users/self/media/recent/?access_token=" +
          access_token + "&count=" + count,
    success: function(data){
      for(var i=0;i<data.data.length; i++){
        $(container).append('<img src="'+data.data[i].images.standard_resolution.url+'" height="350" width="350">');
      }
    }
  });
}
