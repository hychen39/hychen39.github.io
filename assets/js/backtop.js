window.onscroll = function () { scrollFunction(); };

function scrollFunction() {
  // console.log(document.body.scrollTop);
  // console.log(document.documentElement.scrollTop);
  var backTopBtn = document.getElementById("backTopBtn"); 
  // console.log(backTopBtn);
  if (backTopBtn !== null) {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
      document.getElementById("backTopBtn").style.display = "block";
    } else {
      document.getElementById("backTopBtn").style.display = "none";
    }
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}