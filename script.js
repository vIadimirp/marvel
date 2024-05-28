const publicKey = "db2b8b2d469352cb09b4af8d2ae9d18a";
const privateKey = "12d0b3d253dd619b2ad73930c20af56191772fbc";
const ts = "1";
const md5hash = "6f132b3d954666dc27e0af7bddcff27b";

const content = document.querySelector("div.content");
const popup = document.querySelector('div.popup');

let globalData;

let cartItems = [];


fetch(`http://gateway.marvel.com/v1/public/comics?ts=${ts}&apikey=${publicKey}&hash=${md5hash}`)
.then(response => response.json())
.then(data => {
    data["data"]["results"].map(item => item['avaliable'] = true);
    globalData = data["data"]["results"];
    createComicsCards(globalData);
})
.then(() => {
    console.log(sessionStorage.getItem('123496'));
    globalData.map(item => {
        data = sessionStorage.getItem(item.id);
        if (data != null) {
            data = JSON.parse(data);
            cartItems.push(data);
            globalData.map((v, index) => {
                if (v.id == item.id) {
                    globalData[index]['avaliable'] = false;
                }
            });
            createComicsCards(globalData);
            updateCartItems();
        }
    });
});


function createComicsCards(data) {
    data.map(item => {
        createComicsCard(item);
    });
}
function limitedString(str, limit) {
    return str.split(" ").slice(0, limit).join(" ");
}
function createComicsCard(item) {
    const card = document.createElement("div");
    card.classList.add("card");

    const cardImage = document.createElement("img");
    if (item["images"][0]) {
        cardImage.classList.add("card__image");
        cardImage.src = `${item["images"][0]["path"]}.${item["images"][0]["extension"]}`;
    }

    const noCardImage = document.createElement("div");
    noCardImage.classList.add("no-card-image");
    noCardImage.textContent = "No image";

    const cardTitle = document.createElement("div");
    cardTitle.classList.add("card__title");
    cardTitle.textContent = item["title"];

    const cardDescription = document.createElement("div");
    cardDescription.classList.add("card__description");
    if (!["", "#N/A", null].includes(item["description"])) {
        cardDescription.textContent = limitedString(item["description"], 30);
    } else {
        cardDescription.textContent = "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Minima perspiciatis labore at placeat tempora adipisci molestias non, hic sunt! Itaque maiores rerum dignissimos sed doloribus totam reiciendis debitis iusto deserunt?";
    }
    
    const cardList = document.createElement("ul");
    cardList.classList.add("card__list");
    
    const cardAuthors = document.createElement("li");
    cardAuthors.classList.add("card__authors");
    let cardAuthorsTitle = document.createElement('span');
    let cardAuthorsData = document.createElement('label');
    cardAuthorsTitle.textContent = 'Authors:';
    cardAuthorsData.textContent = item["creators"]["items"].length !== 0 ? item["creators"]["items"].map(item => ` ${item.name}`).slice(0, 3) : ' no data';
    cardAuthors.appendChild(cardAuthorsTitle);
    cardAuthors.appendChild(cardAuthorsData);

    const cardCharacters = document.createElement("li");
    cardCharacters.classList.add("card__characters");
    let cardCharactersTitle = document.createElement('span');
    let cardCharactersData = document.createElement('label');
    cardCharactersTitle.textContent = 'Characters:';
    cardCharactersData.textContent = item["characters"]["items"].length !== 0 ? item["characters"]["items"].map(item => ` ${item.name}`).slice(0, 3) : ' no data';
    cardCharacters.appendChild(cardCharactersTitle);
    cardCharacters.appendChild(cardCharactersData);

    const cardDate = document.createElement("li");
    cardDate.classList.add("card__date");
    let cardDateTitle = document.createElement('span');
    let cardDateData = document.createElement('label');
    cardDateTitle.textContent = 'Date:';
    cardDateData.textContent = ' ' + item["dates"][0]["date"].toString().slice(0, 10);
    cardDate.appendChild(cardDateTitle);
    cardDate.appendChild(cardDateData);

    const cardPrice = document.createElement("li");
    cardPrice.classList.add("card__date");
    let cardPriceTitle = document.createElement('span');
    let cardPriceData = document.createElement('label');
    cardPriceTitle.textContent = 'Price:';
    cardPriceData.textContent = item["prices"][0] ? ' ' + item["prices"][0]["price"] + "$" : ' no data';
    cardPrice.appendChild(cardPriceTitle);
    cardPrice.appendChild(cardPriceData);

    const cardLeft = document.createElement("div");
    cardLeft.classList.add("card__left");

    const cardRight = document.createElement("div");
    cardRight.classList.add("card__right");

    const cardRightFooter = document.createElement("div");
    cardRightFooter.classList.add("card__right__footer");

    if (item["images"][0]) {cardLeft.appendChild(cardImage);}
    else {cardLeft.appendChild(noCardImage);}
    cardList.appendChild(cardAuthors);
    cardList.appendChild(cardCharacters);
    cardList.appendChild(cardDate);
    cardList.appendChild(cardPrice);
    cardRight.appendChild(cardTitle);
    cardRight.appendChild(cardDescription);
    cardRight.appendChild(cardList);
    cardRight.appendChild(cardRightFooter);
    cardRightFooter.appendChild(createCounter());
    let addButton = createAddButton(item);
    cardRightFooter.appendChild(addButton);
    if (!item['avaliable']) {
        addButton.disabled = true;
    }
    card.appendChild(cardLeft);
    card.appendChild(cardRight);
    content.appendChild(card);
}
function createCounter() {
    let counter = 1;

    const container = document.createElement('div');
    container.classList.add('counter');

    const counterLabel = document.createElement('label');
    counterLabel.classList.add('counter__label');
    counterLabel.textContent = counter.toString();

    const buttonIncrement = document.createElement('button');
    buttonIncrement.classList.add('counter__button-inc');
    buttonIncrement.textContent = '+';
    buttonIncrement.addEventListener('click', function() {counter++; counterLabel.textContent = counter.toString();})

    const buttonDecrement = document.createElement('button');
    buttonDecrement.classList.add('counter__button-dec');
    buttonDecrement.textContent = '-';
    buttonDecrement.addEventListener('click', function() {
        if (counter > 1) {
            counter--;
            counterLabel.textContent = counter.toString();
        }
    })

    container.appendChild(buttonDecrement);
    container.appendChild(counterLabel);
    container.appendChild(buttonIncrement);

    return container;
}
function createAddButton(item) {
    const addButton = document.createElement('button');
    addButton.classList.add('add-button');
    addButton.textContent = 'Add to cart';
    addButton.addEventListener('click', function() {
        cartItems.push([item, +addButton.parentElement.querySelector('label.counter__label').textContent]);
        updateCartItems();
        item['avaliable'] = false;
        content.textContent = '';
        createComicsCards(globalData);
        sessionStorage.setItem(item.id, JSON.stringify([item, +addButton.parentElement.querySelector('label.counter__label').textContent]));
    });

    if (item['avaliable']) {
        addButton.disabled = false;
    } else {
        addButton.disabled = true;
    }

    return addButton;
}
function cartButtonListener() {
    document.querySelector('button.cart').addEventListener('click', () => {
        popup.classList.add('opened');
        // document.body.classList.add('overflow-hidden');
    });
    document.querySelector('div.popup button.close').addEventListener('click', () => {
        popup.classList.remove('opened');
        // document.body.classList.remove('overflow-hidden');
    });
}
function updateCartItems() {
    document.querySelector('div.popup__cards').textContent = '';
    cartItems.map(item => {
        createCartItem(item);
    });
    let totalPrice = 0;
    cartItems.map(item => {totalPrice += +item[0]["prices"][0]["price"]*item[1]});
    document.querySelector('div.popup__total-price').textContent = `Total: ${totalPrice.toFixed(2)}$`;
}
function createCartItem(item) {
    const cartItem = document.createElement('div');
    cartItem.classList.add('popup__card');

    const cardImage = document.createElement("img");
    if (item[0]["images"][0]) {
        cardImage.classList.add("card__image");
        cardImage.src = `${item[0]["images"][0]["path"]}.${item[0]["images"][0]["extension"]}`;
    }

    const noCardImage = document.createElement("div");
    noCardImage.classList.add("no-card-image");
    noCardImage.textContent = "No image";

    const cartImgDiv = document.createElement('div');
    cartImgDiv.classList.add('card__img');
    
    cartImgDiv.appendChild(item[0]['images'][0] ? cardImage : noCardImage);

    const cartDesc = document.createElement('div');
    cartDesc.classList.add('card__desc');

    const cartTitle = document.createElement('div');
    cartTitle.classList.add('card__title');
    cartTitle.textContent = item[0]['title'];

    const cartQuantity = document.createElement('div');
    cartQuantity.classList.add('card__quantity');
    cartQuantity.textContent = `Quantity: ${item[1]}`;

    const cartPrice = document.createElement('div');
    cartPrice.classList.add('card__price');
    cartPrice.textContent = `${(+item[0]["prices"][0]["price"]*item[1]).toFixed(2)}$`;

    const removeCard = document.createElement('button');
    removeCard.textContent = 'Remove';
    removeCard.addEventListener('click', () => {
        const index = cartItems.findIndex(cartItem => cartItem[0].id === item[0].id);
        cartItems = [
            ...cartItems.slice(0, index),
            ...cartItems.slice(index + 1)
        ];
        item[0]['avaliable'] = true;
        content.textContent = '';
        createComicsCards(globalData);
        updateCartItems();
        sessionStorage.removeItem(item.id);
    })

    cartDesc.appendChild(cartTitle);
    cartDesc.appendChild(cartQuantity);
    cartItem.appendChild(cartImgDiv);
    cartItem.appendChild(cartDesc);
    cartItem.appendChild(cartPrice);
    cartPrice.appendChild(removeCard);
    document.querySelector('div.popup__cards').appendChild(cartItem);
}
cartButtonListener();
