(async function () {
  function waitForElm(selector) {
    return new Promise((resolve) => {
      if (document.querySelector(selector)) {
        return resolve(document.querySelector(selector));
      }

      const observer = new MutationObserver(() => {
        if (document.querySelector(selector)) {
          resolve(document.querySelector(selector));
          observer.disconnect();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
  }

  // //#region SERP Get File Section

  // let serpGetFileSection = await waitForElm(
  //   "#operations-Search_Engine_Results_Pages-SERPController_getFile .opblock-summary-control"
  // );

  // async function getSelectOptions() {
  //   let res = await fetch("http://localhost:3000/serp/firestore/list");
  //   console.log(res.body);
  // }

  // serpGetFileSection.addEventListener("click", async (e) => {
  //   let select = await waitForElm("#operations-Search_Engine_Results_Pages-SERPController_getFile select");

  //   if (select) {
  //     await getSelectOptions();
  //   }

  //   console.log(select);
  // });

  // //#endregion
})();
