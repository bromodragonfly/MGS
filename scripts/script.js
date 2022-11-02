import Api from "./api.js";

const button = document.querySelector(".button");
const popupWrapper = document.querySelector(".popupWrapper");
const locationsListWrapper = document.querySelector("#locationsList");
const dataListWrapper = document.querySelector("#dataList");

const popupTemplate = `
<div class="mainPopupContainer">

<h2 class="popupText">Редактор локаций</h2>
<div class="popupComboboxContainer">
<input  id="jqxcombobox" autocomplete="on"></input>
<button id="popup_button">ADD</button>  
</div>
<div class="popupContainer">
  <div id="popup"></div>
</div>
</div>`;

const getUdatedeDataFields = (oldState, newState) => {
  const oldValues = Object.values(oldState);
  const newValues = Object.values(newState);
  const newFieldsValues = newValues.filter((item) => {
    return oldValues.indexOf(item) === -1;
  });
  const result = newFieldsValues.flatMap((item) => {
    return Object.keys(newState).filter((key) => newState[key] === item);
  });
  return result;
};

let token = null;

$(document).ready(function () {
  let locations = [];
  let data = [];
  this.interval = setInterval(() => {
    token = Api.getAccessToken();
    if (token) {
      clearInterval(this.interval);

      data = Api.getData();
      locations = Api.getLocations();

      $("#dataList").jsGrid({
        width: "100%",
        height: "400px",

        inserting: false,
        noDataContent: "Need to add location",
        editing: false,
        sorting: true,
        paging: true,
        data: data,

        fields: [
          {
            name: "id",
            type: "text",
            visible: false,
            css: "dataID",
          },
          {
            name: "name",
            type: "text",
            validate: "required",
            title: "Name",
          },
          {
            name: "comment",
            type: "text",
            width: 200,
            validate: "required",
            title: "Comments",
          },
          {
            name: "inputLocation",
            type: "text",
            width: 200,
            validate: "required",
            title: "Location",
          },
          {
            name: "status",
            type: "checkbox",
          },

          { type: "control" },
        ],
        onItemInserted: (e) => {
          const { comment, inputLocation, name, status } = e.item;
          Api.addData(name, inputLocation, status, comment);
          data = Api.getData();
        },
        onItemUpdated: (e) => {
          const previousItem = e.previousItem;
          const item = e.item;
          const updatedFields = getUdatedeDataFields(previousItem, item);

          updatedFields.forEach((field) => {
            switch (field) {
              case "name":
                Api.editName(item.id, item.name);
                break;
              case "comment":
                Api.editComment(item.id, item.comment);
                break;
              case "inputLocation":
                Api.editInputLocation(item.id, item.inputLocation);
                break;
              case "status":
                Api.editStatus(item.id, item.status);
                break;
              // case 'type':
              //   break;
              default:
                throw new Error("Hmmm... unussual case");
            }
          });
        },
      });

      $("#locationsList").jsGrid({
        width: "100%",
        height: "400px",

        sorting: true,
        paging: true,

        data: locations,
        noDataContent: "No locations",
        fields: [
          {
            name: "name",
            type: "text",
            align: "center",
            title: "Location name",

            validate: "required",
            css: "locationName",
          },
        ],
      });

      const locationsGridBody =
        locationsListWrapper.querySelector(".jsgrid-grid-body");

      popupWrapper.addEventListener("click", (e) => {
        e.preventDefault();
        data = Api.getData();
        locations = Api.getLocations();

        if (e.target.classList.contains("active")) {
          if (locations.length) {
            $("#locationsList").jsGrid("refresh");
            $("#dataList").jsGrid("option", "inserting", true);
            $("#dataList").jsGrid("option", "editing", true);

            const cellsList =
              locationsGridBody.querySelectorAll(".locationName");

            if (cellsList.length !== locations.length) {
              for (let i = cellsList.length; i < locations.length; i++) {
                $("#locationsList").jsGrid("insertItem", locations[i]);
              }
            }
          }

          popupWrapper.removeChild(
            document.querySelector(".mainPopupContainer")
          );
          popupWrapper.classList.remove("active");
        }

        data = Api.getData();
        locations = Api.getLocations();
      });

      button.addEventListener("click", (e) => {
        e.preventDefault();
        locations = Api.getLocations();
        data = Api.getData();

        const cellsList = locationsGridBody.querySelectorAll(".locationName");

        locations.forEach((item) => {
          $("#popup").jsGrid("insertItem", item);
        });

        if (locations.length > 0) {
          if (cellsList.length < locations.length) {
            for (let i = cellsList.length; i < locations.length; i++) {
              $("#locationsList").jsGrid("insertItem", locations[i]);
            }
          }
        }

        popupWrapper.classList.add("active");
        popupWrapper.insertAdjacentHTML("beforeend", popupTemplate);

        $("#popup").jsGrid({
          width: "100%",
          class: "popup_grid",
          height: "400px",

          editing: true,
          sorting: true,
          paging: true,
          data: locations,
          noDataContent: "No locations",
          fields: [
            {
              name: "name",
              type: "text",
              align: "center",
              validate: "required",
            },
            {
              type: "control",
              width: 10,
              deleteButton: true,
              editButton: false,
            },
          ],
          onItemDeleting: (e) => {
            const itemId = e.item.id;
            Api.deleteLocation(itemId);
            $("#locationsList").jsGrid("deleteItem", e.item);
            locations = Api.getLocations();
          },
          onItemUpdating: (e) => {
            const item = e.item;
            Api.editInputLocation(item.id, item.name);

            locations = Api.getLocations();
          },
        });

        if (locations.length > 0) {
          const locationsNames = locations.map((item) => item.name);

          $("#jqxcombobox").autocomplete({
            classes: {
              "ui-autocomplete": "highlight",
            },
            appendTo: "#jqxcombobox",
            source: locationsNames,
          });
        }

        $("#popup_button").click((e) => {
          data = Api.getData();
          $("#dataList").jsGrid("refresh");
          locations = Api.getLocations();

          const inputLocation = document.querySelector("#jqxcombobox");
          if (inputLocation.value !== "") {
            Api.addLocation(`${inputLocation.value}`);
            $("#popup").jsGrid("insertItem", { name: inputLocation.value });
            locations = Api.getLocations();

            inputLocation.value = "";
          }
        });
      });
    }
  }, 500);
});
