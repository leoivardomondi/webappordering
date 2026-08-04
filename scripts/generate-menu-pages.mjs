import fs from 'node:fs';

const footer = `
    <footer>
        <div class="footer-top">
            <div class="social-news-container">
                <div class="social-icons">
                    <a href="#"><i class="fa-brands fa-facebook-f"></i></a>
                    <a href="#"><i class="fa-brands fa-twitter"></i></a>
                    <a href="#"><i class="fa-brands fa-instagram"></i></a>
                </div>
                <p>Join our exclusive list</p>
                <form class="newsletter-form">
                    <input type="email" placeholder="Email address">
                    <button type="submit" class="btn-outline">Subscribe</button>
                </form>
                <p class="disclaimer">By clicking "SUBSCRIBE" I agree to receive news, promotions, and offers from Wine & Bottle.</p>
            </div>
            <div class="awards-container">
                <div class="award-badge"><i class="fa-solid fa-wine-bottle"></i><span>Sommelier Choice</span></div>
                <div class="award-badge"><i class="fa-solid fa-star"></i><span>Michelin Guide</span></div>
            </div>
        </div>
        <div class="footer-main">
            <div class="col contact-col">
                <h3>CONTACT US</h3>
                <ul>
                    <li><a href="tel:0725072135">0725 072135</a></li>
                </ul>
            </div>
            <div class="col locations-col">
                <h3>LOCATIONS</h3>
                <ul class="location-list">
                    <li>Westlands</li>
                    <li>Parklands</li>
                    <li>Nyari</li>
                    <li>Kileleshwa</li>
                    <li style="font-style: italic; opacity: 0.7;">Coming soon</li>
                </ul>
            </div>
            <div class="col menu-col">
                <h3>OUR MENU</h3>
                <ul>
                    <li><a href="breakfast.html">BREAKFAST</a></li>
                    <li><a href="drinks.html">DRINKS</a></li>
                    <li><a href="big-meals.html">MAINS</a></li>
                    <li><a href="desserts.html">DESSERTS</a></li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <p>Experience the finest selection of wines and dining. All visuals are serving suggestions only. Prices inclusive of VAT.</p>
            <div class="bottom-links"><a href="#">Privacy Policy</a> | <a href="#">Terms of Use</a> | <a href="#">Contact Us</a></div>
            <p class="copyright">&copy; 2026 Wine & Bottle. All Rights Reserved</p>
        </div>
    </footer>`;

const nav = `
    <header class="top-navbar">
        <div class="nav-container">
            <a href="index.html" class="nav-logo"><img src="images/nav-logo.png" alt="Wine & Bottle" class="header-logo"></a>
            <input type="checkbox" id="mobile-menu-toggle" class="mobile-menu-toggle" aria-label="Toggle menu">
            <nav class="nav-links">
                <a href="index.html">HOME</a>
                <a href="menu.html" class="active">MENU</a>
                <a href="#">FEATURED PRODUCTS</a>
                <a href="#">DEALS</a>
            </nav>
            <div class="nav-icons">
                <a href="cart.html" class="cart-icon"><i class="fa-solid fa-cart-shopping"></i><span class="cart-count">0</span></a>
                <a href="#" class="user-icon"><i class="fa-solid fa-user-circle"></i></a>
            </div>
            <label for="mobile-menu-toggle" class="mobile-menu-button" aria-label="Open menu"><span></span><span></span><span></span></label>
        </div>
    </header>`;

const images = {
  breakfast: 'https://images.unsplash.com/photo-1496042399014-dc73c4f2bde1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  waffles: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  pancakes: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  pastry: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  muffin: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  omelette: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  fruit: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  steak: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  chicken: 'https://images.unsplash.com/photo-1562967914-608f82629710?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  fish: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  soup: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  sandwich: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  curry: 'https://images.unsplash.com/photo-1631292784640-2b24be784d5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  pasta: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  drinks: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  tea: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  dawaTea: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  kiddieDrink: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  milkshake: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  smoothie: 'https://images.unsplash.com/photo-1502741224143-90386d7f8c82?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  juice: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  booster: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  specialtyJuice: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  icedTea: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  lemonade: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  colada: 'https://images.unsplash.com/photo-1563223771-375783ee91ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  nojito: 'https://images.unsplash.com/photo-1551751299-1b51cab2694c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  coffee: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  icedMocha: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  mocha: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  icedLatte: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  latte: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  cappuccino: 'https://images.unsplash.com/photo-1534778101976-62847782c213?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  chocolate: 'https://images.unsplash.com/photo-1511381939415-e44015466834?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  cake: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  cheesecake: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  sundae: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  icecream: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
};

const categories = [
  {
    title: 'BIG ON BREAKFAST',
    file: 'breakfast.html',
    crumb: 'Breakfast',
    description: 'Breakfast favorites, pastries, waffles, omelettes, muffins, extras, and fresh morning plates.',
    subcategories: [
      ['BREAKFAST COMBOS', 'breakfast-combos.html', images.breakfast],
      ['RANGER BREAKFAST', 'ranger-breakfast.html', images.breakfast],
      ['WONDERFUL WAFFLES', 'wonderful-waffles.html', images.waffles],
      ['FLUFFY PANCAKES', 'fluffy-pancakes.html', images.pancakes],
      ['PASTRIES', 'breakfast-pastries.html', images.pastry],
      ['EXTRAS', 'breakfast-extras.html', images.breakfast],
      ['AMAZING MUFFINS', 'amazing-muffins.html', images.muffin],
      ['DESIGNER OMELETTES', 'designer-omelettes.html', images.omelette],
      ['FRUITFUL MORNINGS', 'fruitful-mornings.html', images.fruit]
    ]
  },
  {
    title: 'GENEROUS BIG MEALS',
    file: 'big-meals.html',
    crumb: 'Big Meals',
    description: 'Big meals, starters, salads, sandwiches, grills, pasta, pizza, curries, and family-friendly plates.',
    subcategories: [
      ['RAMADAN SPECIAL', 'ramadan-special.html', images.curry],
      ['BIG MEAL COMBOS', 'big-meal-combos.html', images.steak],
      ['STARTERS AND APPETIZERS', 'starters-and-appetizers.html', images.chicken],
      ['BITS & BITES', 'bits-and-bites.html', images.burger],
      ['SOUPS', 'soups.html', images.soup],
      ['SALADS', 'salads.html', images.salad],
      ['SANDWICHES', 'sandwiches.html', images.sandwich],
      ['BURGERS', 'burgers.html', images.burger],
      ['CHICKEN', 'chicken.html', images.chicken],
      ['FISH', 'fish.html', images.fish],
      ['BEEF', 'beef.html', images.steak],
      ['CURRIES', 'curries.html', images.curry],
      ['PASTA', 'pasta.html', images.pasta],
      ['MEX-FIX', 'mex-fix.html', images.burger],
      ['PIZZA', 'pizza.html', images.pizza],
      ['KIDDIE MEALS', 'kiddie-meals.html', images.chicken],
      ['EXTRAS', 'meal-extras.html', images.pasta]
    ]
  },
  {
    title: 'PERFECTED DRINKS',
    file: 'drinks.html',
    crumb: 'Drinks',
    description: 'Cold refreshers, shakes, juices, teas, coffee classics, chocolate drinks, and bright crafted coolers.',
    subcategories: [
      ['DAWA TEAS', 'dawa-teas.html', images.dawaTea],
      ['KIDDIE DRINKS', 'kiddie-drinks.html', images.kiddieDrink],
      ['CREAMY MILKSHAKES', 'creamy-milkshakes.html', images.milkshake],
      ['REAL FRUIT-SMOOTHIES', 'real-fruit-smoothies.html', images.smoothie],
      ['FRUIT BOOSTERS', 'fruit-boosters.html', images.booster],
      ['SPECIALTY JUICES', 'specialty-juices.html', images.specialtyJuice],
      ['REFRESHING ICED TEAS', 'refreshing-iced-teas.html', images.icedTea],
      ['HANDCRAFTED LEMONADES', 'handcrafted-lemonades.html', images.lemonade],
      ['COLADAS', 'coladas.html', images.colada],
      ['NOJITOS', 'nojitos.html', images.nojito],
      ['CHOCOLATE', 'chocolate.html', images.chocolate],
      ['TEA', 'tea.html', images.tea],
      ['ICED MOCHA', 'iced-mocha.html', images.icedMocha],
      ['MOCHA', 'mocha.html', images.mocha],
      ['ICED LATTE', 'iced-latte.html', images.icedLatte],
      ['LATTE', 'latte.html', images.latte],
      ['CAPPUCCINO', 'cappuccino.html', images.cappuccino],
      ['COFFEE', 'coffee.html', images.coffee]
    ]
  },
  {
    title: 'DECADENT DESSERTS',
    file: 'desserts.html',
    crumb: 'Desserts',
    description: 'Dessert treats from chocolate and cheesecakes to muffins, pastries, sundaes, and fruit delights.',
    subcategories: [
      ['DUBAI CHOCOLATE', 'dubai-chocolate.html', images.chocolate],
      ['CHEESE CAKES', 'cheese-cakes.html', images.cheesecake],
      ['AMAZING MUFFINS', 'dessert-muffins.html', images.muffin],
      ['PASTRIES', 'dessert-pastries.html', images.pastry],
      ['FRUITFUL DELIGHT', 'fruitful-delight.html', images.fruit],
      ['SUNDAES', 'sundaes.html', images.sundae],
      ['A LA MODE', 'a-la-mode.html', images.cake],
      ['PREMIUM ICE CREAM', 'premium-ice-cream.html', images.icecream],
      ['CAKE SLICES', 'cake-slices.html', images.cake]
    ]
  }
];

const productNames = {
  breakfast: ['Classic Plate', 'House Combo', 'Signature Stack', 'Deluxe Serving'],
  meal: ['House Plate', 'Chef Special', 'Big Combo', 'Classic Serving'],
  drink: ['Classic Glass', 'House Special', 'Refreshing Blend', 'Signature Pour'],
  dessert: ['Classic Treat', 'House Dessert', 'Premium Serving', 'Sweet Special']
};

const productImages = {
  breakfast: [
    'https://images.unsplash.com/photo-1525351484163-7529414344d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1533920379810-6bedac961555?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1554520735-0a6b8b6ce8b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1528207776546-365bb710ee93?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1562376552-0d160a2f238d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1510693206972-df098062cb71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1509365465985-25d11c17e812?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  ],
  meal: [
    'https://images.unsplash.com/photo-1546964124-0cce460f38ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1558030006-450675393462?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1562967914-608f82629710?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1560781290-7dc94c0f8f4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1631292784640-2b24be784d5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1551183053-bf91a1d81141?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  ],
  drink: [
    'https://images.unsplash.com/photo-1536935338788-843bb6303668?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1572490122747-3968b75cc699?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1502741224143-90386d7f8c82?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1621263764928-df1444c5e859?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1511381939415-e44015466834?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  ],
  dessert: [
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1509365465985-25d11c17e812?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1511381939415-e44015466834?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  ]
};

function slugTitle(title) {
  return title.replace(/&/g, 'AND').replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
}

function slugFile(value) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function stableOffset(value, modulo) {
  return [...value].reduce((sum, char) => sum + char.charCodeAt(0), 0) % modulo;
}

function htmlShell(title, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - The Wine & Bottle</title>
    <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&family=Playfair+Display:ital,wght@0,700;0,900;1,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="menu.css">
</head>
<body class="menu-page-body">
${nav}
${body}
${footer}
<script src="app.js"></script>
</body>
</html>
`;
}

function categoryPage(category) {
  const cards = category.subcategories.map(([name, file, image]) => `
            <a href="${file}" class="food-item">
                <div class="food-card-img"><img src="${image}" alt="${name}"></div>
                <h4>${name}</h4>
            </a>`).join('');

  return htmlShell(category.title, `
    <main class="menu-content">
        <section class="welcome-header">
            <p style="font-size: 12px; color: #888; margin-bottom: 10px; text-transform: uppercase;"><a href="menu.html">Menu</a> / ${category.crumb}</p>
            <h1>${category.title}</h1>
            <p>${category.description}</p>
        </section>
        <section class="item-grid">
${cards}
        </section>
    </main>`);
}

function productPage(category, subcategory, kind) {
  const [name, , image] = subcategory;
  const clean = slugTitle(name);
  const names = productNames[kind];
  const imagePool = productImages[kind];
  const offset = stableOffset(name, imagePool.length);
  const products = names.map((suffix, index) => {
    const price = kind === 'drink' ? 450 + index * 120 : kind === 'dessert' ? 500 + index * 90 : kind === 'breakfast' ? 750 + index * 120 : 950 + index * 180;
    const productImage = imagePool[(offset + index) % imagePool.length];
    const productTitle = `${clean} ${suffix.toUpperCase()}`;
    const detailFile = `product-${slugFile(name)}-${index + 1}.html`;
    return `
            <div class="product-item">
                <a href="${detailFile}" class="food-card-img"><img src="${productImage}" alt="${productTitle}"></a>
                <h4>${productTitle}</h4>
                <p class="price">KSH ${price.toLocaleString('en-US')}</p>
                <a href="${detailFile}" class="btn-order">ORDER</a>
            </div>`;
  }).join('');

  return htmlShell(name, `
    <section class="page-hero" style="background-image: url('${image.replace('w=600', 'w=1600')}');">
        <div class="hero-overlay"><h1>${name}</h1></div>
    </section>
    <main class="menu-content">
        <div class="breadcrumbs">
            <a href="menu.html">MENU</a>
            <span class="separator">&gt;</span>
            <a href="${category.file}">${category.title}</a>
            <span class="separator">&gt;</span>
            <span class="current">${name}</span>
        </div>
        <section class="item-grid product-grid">
${products}
        </section>
    </main>`);
}

function productDescription(kind, subcategoryName, productTitle) {
  if (kind === 'drink') {
    return `${productTitle} is prepared fresh with balanced flavor, chilled service, and a polished Wine & Bottle finish.`;
  }
  if (kind === 'dessert') {
    return `${productTitle} is a sweet house serving made for a rich finish after your meal or a relaxed treat on its own.`;
  }
  if (kind === 'breakfast') {
    return `${productTitle} is a satisfying breakfast plate from our ${subcategoryName.toLowerCase()} selection, served fresh and ready to enjoy.`;
  }
  return `${productTitle} is a generous meal from our ${subcategoryName.toLowerCase()} selection, served hot with a satisfying restaurant-style finish.`;
}

function optionGroups(kind) {
  if (kind === 'drink') {
    return [
      ['SERVING TEMPERATURE', ['Chilled', 'No Ice', 'Room Temperature']],
      ['ADD-ONS', ['Lemon Slice', 'Mint', 'Extra Syrup']]
    ];
  }
  if (kind === 'dessert') {
    return [
      ['DESSERT ADD-ON', ['Whipped Cream', 'Chocolate Sauce', 'Berry Topping']],
      ['SERVING OPTION', ['Dine In', 'Take Away']]
    ];
  }
  if (kind === 'breakfast') {
    return [
      ['CHOICE OF SIDE', ['Toast', 'Fruit Cup', 'Breakfast Potatoes']],
      ['EGG STYLE', ['Fried Egg', 'Scrambled Egg', 'Omelette']]
    ];
  }
  return [
    ['CHOICE OF SIDE', ['Fries', 'Rice', 'Garden Salad']],
    ['SAUCE OPTION', ['BBQ Sauce', 'Garlic Sauce', 'Chilli Sauce']]
  ];
}

function detailPage(category, subcategory, kind, index) {
  const [subcategoryName, subcategoryFile, heroImage] = subcategory;
  const clean = slugTitle(subcategoryName);
  const suffix = productNames[kind][index];
  const productTitle = `${clean} ${suffix.toUpperCase()}`;
  const imagePool = productImages[kind];
  const offset = stableOffset(subcategoryName, imagePool.length);
  const productImage = imagePool[(offset + index) % imagePool.length];
  const price = kind === 'drink' ? 450 + index * 120 : kind === 'dessert' ? 500 + index * 90 : kind === 'breakfast' ? 750 + index * 120 : 950 + index * 180;
  const groups = optionGroups(kind).map(([title, options]) => `
                <div class="option-group">
                    <h3>${title}</h3>
                    <label class="option-select-label" for="${slugFile(title)}-${index}">Select the option</label>
                    <select id="${slugFile(title)}-${index}" class="option-select">
                        ${options.map((option) => `<option>${option}</option>`).join('')}
                    </select>
                    <div class="option-chips">
                        ${options.map((option) => `<span>${option}</span>`).join('')}
                    </div>
                </div>`).join('');

  return htmlShell(productTitle, `
    <main class="menu-content product-detail-content">
        <div class="breadcrumbs">
            <a href="menu.html">MENU</a>
            <span class="separator">&gt;</span>
            <a href="${category.file}">${category.title}</a>
            <span class="separator">&gt;</span>
            <a href="${subcategoryFile}">${subcategoryName}</a>
            <span class="separator">&gt;</span>
            <span class="current">${productTitle}</span>
        </div>
        <section class="product-detail-layout">
            <div class="product-detail-image">
                <img src="${productImage}" alt="${productTitle}">
            </div>
            <div class="product-detail-panel">
                <p class="product-eyebrow">${category.title}</p>
                <h1>${productTitle}</h1>
                <p class="product-description">${productDescription(kind, subcategoryName, productTitle)}</p>
                <p class="detail-price">KSH ${price.toLocaleString('en-US')}</p>
${groups}
                <div class="quantity-row">
                    <span>Quantity</span>
                    <div class="quantity-control">
                        <button type="button" aria-label="Decrease quantity">-</button>
                        <input type="number" value="1" min="1" aria-label="Quantity">
                        <button type="button" aria-label="Increase quantity">+</button>
                    </div>
                </div>
                <div class="detail-actions">
                    <button type="button" class="btn-detail-primary js-add-to-cart" data-product-title="${productTitle}" data-product-price="${price}" data-product-image="${productImage}" data-product-url="product-${slugFile(subcategoryName)}-${index + 1}.html">ADD TO ORDER</button>
                    <button type="button" class="btn-detail-secondary js-add-to-favourite" data-product-title="${productTitle}" data-product-price="${price}" data-product-image="${productImage}" data-product-url="product-${slugFile(subcategoryName)}-${index + 1}.html">ADD TO FAVOURITE</button>
                </div>
                <p class="availability-note">Breakfast products are available before 12PM only. Generous Big Meal products are available after 11AM only.</p>
            </div>
        </section>
    </main>
    <script>
        document.querySelectorAll('.quantity-control').forEach((control) => {
            const input = control.querySelector('input');
            const buttons = control.querySelectorAll('button');
            buttons[0].addEventListener('click', () => {
                input.value = Math.max(1, Number(input.value || 1) - 1);
            });
            buttons[1].addEventListener('click', () => {
                input.value = Number(input.value || 1) + 1;
            });
        });
    </script>`);
}

for (const category of categories) {
  fs.writeFileSync(category.file, categoryPage(category));
  const kind = category.file === 'breakfast.html' ? 'breakfast' : category.file === 'drinks.html' ? 'drink' : category.file === 'desserts.html' ? 'dessert' : 'meal';
  for (const subcategory of category.subcategories) {
    fs.writeFileSync(subcategory[1], productPage(category, subcategory, kind));
    productNames[kind].forEach((_suffix, index) => {
      fs.writeFileSync(`product-${slugFile(subcategory[0])}-${index + 1}.html`, detailPage(category, subcategory, kind, index));
    });
  }
}
