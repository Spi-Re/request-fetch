// Переменные
const input = document.querySelector(".input");
const li = document.querySelectorAll("li");
const placeHelp = document.querySelector(".place-help");
// объект с результатами fetch
let objOfTopics = {};

// debounce
function debounce(callback, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => callback.apply(this, args), delay);
  };
}

// есть чё в строке поиска?
function call() {
  if (input.value !== "") {
    request(input.value);
  } else {
    for (let item of placeHelp.children) {
      item.classList.remove("active");
    }
  }
}

// обёртка debounce
const debounceCall = debounce(call, 400);

// Отсылает запрос в гитхаб
function request(name) {
  return (
    fetch(
      `https://api.github.com/search/repositories?q=${name}+language:assembly&per_page=100`
    )
      //   принимает документ из 100 объектов
      .then((response) => response.json())
      // отбирает имена этих объектов в массив
      .then((repository) => {
        objOfTopics.arrNameOfResult = repository.items.map((item) => item.name);
        objOfTopics.arrAuthorOfResult = repository.items.map(
          (item) => item.owner.login
        );
        objOfTopics.arrStarsOfResult = repository.items.map(
          (item) => item.stargazers_count
        );
        return objOfTopics;
      })
      //   отбираются только те варианты, которые начинаются как запрос в поиске
      .then(function (objOfTopics) {
        objOfTopics.newArrName = [];
        objOfTopics.newArrAuthor = [];
        objOfTopics.newArrStars = [];

        objOfTopics.arrNameOfResult.map(function (item, index) {
          if (item.startsWith(name)) {
            objOfTopics.newArrName.push(item);
            objOfTopics.newArrAuthor.push(objOfTopics.arrAuthorOfResult[index]);
            objOfTopics.newArrStars.push(objOfTopics.arrStarsOfResult[index]);
          }
        });

        return objOfTopics;
        // Как-нибудь додумать как дальше можно
        // objOfTopics.arrNameOfResult = objOfTopics.arrNameOfResult
        //   .filter((item) => item.startsWith(name))
        //   .slice(0, 5);
      })

      // записывает 5 лучших вариантов в документ html
      .then(function (objOfTopics) {
        //   записывает результат поиска в документ в li
        for (let i = 0; i < 5; i++) {
          placeHelp.children[i].textContent = objOfTopics.newArrName[i];
        }
        placeHelp.style.display = "block";

        // укорачиваю массив
        objOfTopics.newArrName.length = 5;
        objOfTopics.newArrAuthor.length = 5;
        objOfTopics.newArrStars.length = 5;

        // лишние св-ва
        delete objOfTopics.arrNameOfResult;
        delete objOfTopics.arrAuthorOfResult;
        delete objOfTopics.arrStarsOfResult;
      })
      // вызывает функцию, которая динамически выводит результаты в html
      .then(function () {
        toggleActive();
      })
      // Ловит ошибки
      .catch(function (e) {
        console.log("Ошибка: " + e.message);
      })
  );
}

// показывает / убирает класс active для отображения в браузере
function toggleActive() {
  let arr = [];
  li.forEach((item) => {
    arr.push(item.textContent.toLowerCase());
  });
  arr.forEach((item, index) => {
    let emptyLi = placeHelp.children[index].textContent === "";
    if (input.value.length !== 0) {
      if (emptyLi) {
        placeHelp.children[index].classList.remove("active");
      } else placeHelp.children[index].classList.add("active");
    } else {
      placeHelp.children[index].classList.remove("active");
    }
  });
}

let targetTopic = {
  nameOfTopic: null,
  author: null,
  stars: null,
  index: null,
};

// закидывает данные конкретного топика в отдельный объект
function goAfter() {
  placeHelp.addEventListener("click", function (e) {
    targetTopic.nameOfTopic = e.target.textContent;
    targetTopic.index = objOfTopics.newArrName.indexOf(targetTopic.nameOfTopic);
    targetTopic.author = objOfTopics.newArrAuthor[targetTopic.index];
    targetTopic.stars = objOfTopics.newArrStars[targetTopic.index];
    input.value = "";
    createObjToPage();
  });
}

// создаёт карточки с нужным топиком
function createObjToPage(obj) {
  let wrapperResultArea = document.querySelector(".wrapper--result-area");
  let newTopic = document.createElement("div");
  let pName = document.createElement("p");
  let pAuthor = document.createElement("P");
  let pStars = document.createElement("p");

  newTopic.classList.add("topic");
  pName.textContent = `Name: ${targetTopic.nameOfTopic}`;
  pAuthor.textContent = `Author: ${targetTopic.author}`;
  pStars.textContent = `Stars: ${targetTopic.stars}`;
  wrapperResultArea.style.display = "block";

  newTopic.appendChild(pName);
  newTopic.appendChild(pAuthor);
  newTopic.appendChild(pStars);
  placeHelp.style.display = "none";
  wrapperResultArea.appendChild(newTopic);

  //   создаёт кнопку удаления и обрабатывает закрытие
  for (let topic of wrapperResultArea.children) {
    let topicDelete = document.createElement("div");
    topicDelete.classList.add("close-topic");
    newTopic.appendChild(topicDelete);

    topicDelete.addEventListener("click", function () {
      newTopic.remove();
    });
  }
}

// Основа основ
function go() {
  input.addEventListener("keyup", debounceCall);
  goAfter();
}

// вызов
go();
