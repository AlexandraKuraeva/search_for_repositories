'use strict';

// const searchBtn = document.getElementById('search-btn'); // Кнопка поиска
// const inputField = document.getElementById('search-field'); // Поле ввода
// const reposList = document.getElementById('repos'); // Элемент, в котором будет отображаться результат

// Обработчик нажатия кнопки поиска
// searchBtn.addEventListener('click', (event) => {
//   event.preventDefault();
//   const searchQuery = inputField.value; // Получаем значение из поля ввода
//   console.log(searchQuery);
//   const apiUrl = `https://api.github.com/search/repositories?q=${searchQuery}`; // Формируем URL запроса

//   //   Выполняем запрос
//   fetch(apiUrl)
//     .then((response) => response.json()) // Преобразуем ответ в JSON
//     .then((data) => {
//       // При успешном выполнении запроса обрабатываем результат
//       reposList.innerHTML = ''; // Очищаем результаты предыдущего поиска
//       const items = data.items.slice(0, 10);
//       console.log(items);
//       // Создаем элементы списка репозиториев и добавляем их в результирующий блок
//       const repositories = items.map((item) => {
//         let link = `<a href="${item.html_url}" target="_blank">${item.name}</a>`; // Ссылка на репозиторий
//         return `<li>${link}</li>`;
//       });
//       reposList.innerHTML = `<ul>${repositories.join('')}</ul>`;
//     })
//     .catch((error) => console.error(error));
// });

// const searchRepositories = async (query) => {
//   const url = `https://api.github.com/search/repositories?q=${query}`;
//   const response = await fetch(url);
//   const data = await response.json();
//   console.log(data)
//   const repositories = data.items.map((item) => ({
//     name: item.name,
//     url: item.html_url,
//   }));
//   return repositories;
// };

// Пример использования функции
// searchRepositories(inputField.value).then((repositories) => {
//   repositories.forEach((repository) => {
//     console.log(repository.name, repository.url);
//   });
// });

// fetch(apiUrl)
//   .then(response => response.json())
//   .then(data => {
//     result.innerHTML = '';
//     const items = data.items.slice(0, 10);
//     // Используем метод map() для получения нового массива из элементов репозиториев, преобразованных в элементы списка
//     const repositories = items.map(item => {
//       const link = `<a href="${item.html_url}">${item.full_name}</a>`;
//       return `<li>${link}</li>`;
//     });
//     // Объединяем все элементы списка вместе
//     result.innerHTML = `<ul>${repositories.join('')}</ul>`;
//   })
//   .catch(error => {
//     console.error(error);
//   });
const searchBtn = document.getElementById('search-btn'); // Кнопка поиска
const inputField = document.getElementById('search-field'); // Поле ввода
const reposList = document.getElementById('repos'); // Элемент, в котором будет отображаться результат
const loadingIndicator = document.getElementById('loadingIndicator');

searchBtn.addEventListener('click', function (event) {
  event.preventDefault();
  searchRepos();
});

function searchRepos() {
  const searchQuery = inputField.value; // Получаем значение из поля ввода
  const queryURL = `https://api.github.com/search/repositories?q=${searchQuery}`;
  reposList.innerHTML = ''; // очищаем список показываемых репозиториев

  let isAnyError = false;

  const queryValidationResult = getValidationResult(searchQuery);
  if (!queryValidationResult.check) {
    isAnyError = true;
    showError(inputField, isAnyError);
  }

  if (isAnyError) {
    e.preventDefault();
    return;
  }

  showLoadingBlock(); //Показать блок загрузки

  getRepos(queryURL) //Получаем репазитории
    .then((response) => response.json()) // Преобразуем ответ в JSON

    .then((repos) => showReposList(repos)) //Показать список репозиториев
    .catch((error) => {
      console.log('error: ', error);
    })
    .finally(() => {
      hideLoadingBlock();
    });
}

function getRepos(queryURL) {
  return fetch(queryURL);
}

//Показать список репозиториев
function showReposList(reposResponse) {
  if (reposResponse.items.length === 0) {
    showNoReposFound(inputField.value);
    return;
  }

  const repos = reposResponse.items.slice(0, 10);
  const reposReduced = repos.map((repo) => {
    return {
      name: repo.name,
      url: repo.html_url,
      owner: {
        login: repo.owner.login,
        url: repo.owner.html_url,
        avatar_url: repo.owner.avatar_url,
      },

      language: repo.language,
      description: repo.description,
    };
  });
  reposReduced.forEach((repo) => {
    console.log(repo);
    insertItemsList(repo);
  });
}

//Вставить найденные рапозиторий в список
function insertItemsList(repo) {
  let out = `<li class="repos__item repo">
	<div class="repo__top">
		<img src="${repo.owner.avatar_url}" alt="avatar" class="repo__avatar">
		
			<div class="repo__owner">Владелец:
				<a href="${repo.owner.url}" target="_blank">${repo.owner.login}</a>
			</div>
			<div class="repo__name">Название репозитория:
				<a href="${repo.url}" target="_blank">${repo.name}</a>
			</div>
		
	</div>
	
		<div class="repo__description">
		${repo.description === null ? 'У этого репазитория нет описания &#128532' : repo.description}</div>
		<div class="repo__language">
			Основной язык: 
			<span class="repo__span">${repo.language || '-'}</span>
		</div>
	
</li>`;
  reposList.innerHTML += out;
}

function showNoReposFound(value) {
  let out = `
<div class="not__found"><p>По запросу "${value}" ничего не найдено</p></div>`;

  reposList.innerHTML += out;
}

//Блок загрузки
//показать
function showLoadingBlock() {
  loadingIndicator.style.display = 'block';
}

//скрыть
function hideLoadingBlock() {
  loadingIndicator.style.display = 'none';
}

function getValidationResult(valueInput) {
  const [min, max] = [3, 32];
  const value = valueInput.trim();
  if (min > value.length) {
    return { check: false };
  }
  if (max < value.length) {
    return { check: false };
  }
  return { check: true };
}
//Показать блок ошибки
function showError(field, error) {
 
  //Проверим отображается ли уже ошибка
  const elemBox = field.closest('.form-search__group');
  const errorBox = elemBox.querySelector('.error');
  if (errorBox) {
    // если ошибка уже отображается, то останавливаемся
    return;
  }

  if (error) {
    const errorBlock = document.createElement('span');
    errorBlock.textContent = 'Введите минимум 3 символа';
    errorBlock.classList.add('error');
    elemBox.append(errorBlock);
    field.classList.add('error-input');
  }
  field.addEventListener('input', hideError);
}

//Скрытие блока ошибки
function hideError() {
  inputField.classList.remove('error-input');
  const formGroup = inputField.closest('.form-search__group');
  const error = formGroup.querySelector('.error');
  if (error) {
    error.remove();
  }
}
