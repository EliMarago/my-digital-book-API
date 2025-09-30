//aspetta che il dom sia completamente caricato
document.addEventListener("DOMContentLoaded", () => {
  const stars = document.querySelectorAll(".rating-stars svg"); // seleziona tutte le icone svg
  const ratingInput = document.getElementById("rating"); // seleziona l'input nascosto dove viene memorizzato il valore del rating

  stars.forEach((star, index) => {
    //index rappresenta la posizione della stella (0,1 ...)
    star.addEventListener("click", () => {
      //quando una stella viene ciccata calcola il rating(index + 1)
      const ratingValue = index + 1;
      ratingInput.value = ratingValue;

      //colorare le stelle
      //clicco sulla stella(s) e ottengo l'indice(i)
      stars.forEach((s, i) => {
        //Se l’indice della stella è inferiore al valore selezionato (ratingValue) la stella viene colorata
        if (i < ratingValue) {
          s.querySelector("path").setAttribute("fill", "#f89d4f");
        } else {
          s.querySelector("path").setAttribute("fill", "none");
        }
      });
    });
  });
});
