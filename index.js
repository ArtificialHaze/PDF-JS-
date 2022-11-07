// VARIABLES

const url = "[PDF_GOES_HERE]";

let pdfDocument = null;
let pageNumber = 1;
let isRendering = false;
let pageNumberIsPending = null;

const scale = 1.25;
const canvas = document.querySelector("#pdf-render");
const ctx = canvas.getContext("2d");

// FUNCTIONS

const renderPage = (number) => {
  isRendering = true;
  pdfDocument.getPage(number).then((page) => {
    const viewPort = page.getViewport({ scale: scale });
    canvas.height = viewPort.height;
    canvas.width = viewPort.width;
    const renderContext = {
      canvasContext: ctx,
      viewPort,
    };
    page.render(renderContext).promise.then(() => {
      isRendering = false;
      if (pageNumberIsPending !== null) {
        renderPage(pageNumberIsPending);
        pageNumberIsPending = null;
      }
    });

    document.querySelector("#page-number").textContent = number;
  });
};

const renderPageQueue = (number) => {
  if (isRendering) {
    pageNumberIsPending = number;
  } else {
    renderPage(number);
  }
};

const showPreviousPage = () => {
  if (pageNumber <= 1) return;
  pageNumber--;
  renderPageQueue(pageNumber);
};

const showNextPage = () => {
  if (pageNumber >= pdfDocument.numPages) return;
  pageNumber++;
  renderPageQueue(pageNumber);
};

pdfjsLib.getDocument(url).promise.then((_pdfDoc) => {
  pdfDocument = _pdfDoc;
  document.querySelector("#page-count").textContent = pdfDocument.numPages;
  renderPage(pageNumber);
});

// EVENT LISTENERS

document
  .querySelector("#previous-page")
  .addEventListener("click", showPreviousPage);
document
  .querySelector("#next-page")
  .addEventListener("click", showNextPage)
  .catch((err) => {
    const div = document.createElement("div");
    div.className = "error-info";
    div.appendChild(document.createTextNode(err.message));
    document.querySelector("body").insertBefore(div, canvas);
    document.querySelector(".top-bar").style.display = "none";
  });
