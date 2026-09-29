 const animaciones = document.querySelectorAll(".animacion");

animaciones.forEach(video => {

    video.addEventListener("mouseenter", () => {
        video.currentTime = 0;
        video.play();
    });

    video.addEventListener("mouseleave", () => {
        video.pause();
        video.currentTime = 0;
    });

});