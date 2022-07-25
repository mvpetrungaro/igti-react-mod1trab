const api = 'https://makeup-api.herokuapp.com/api/v1/products.json?product_type=blush'
const currencyFormatter = Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const unique = (v, i, s) => !!v && s.indexOf(v) === i

const catalog = document.querySelector('section.catalog')
const nameFilter = document.getElementById('filter-name')
const brandFilter = document.getElementById('filter-brand')
const typeFilter = document.getElementById('filter-type')
const sortOption = document.getElementById('sort-type')

let nameFilterTimer = null
let lastNameFilterEvaluated = ''

let allProducts = []
let filteredProducts = []
let brandsList = []
let typesList = []

init()

function init() {
  loading(true)

  fetch(api)
  .then(res => res.json())
  .then(sortProductsByRating)
  .then(products => {
    allProducts = products
    filteredProducts = products
    return products
  })
  .then(products => {
    loadProducts()
    loadBrandsFilter(products.map(p => p.brand).filter(unique).sort())
    loadTypesFilter(products.map(p => p.product_type).filter(unique).sort())
  })
  .then(() => loading(false))
  .catch(err => {
    alert('Erro ao carregar produtos. Para mais informações, olhar o log do console.')
    console.log(err)
    loading(false)
  })

  nameFilter.addEventListener('keydown', (ev) => {
    if (nameFilterTimer) {
      clearTimeout(nameFilterTimer)
    }

    nameFilterTimer = setTimeout(() => {
      if (lastNameFilterEvaluated !== nameFilter.value) {
        lastNameFilterEvaluated = nameFilter.value
        filterProducts()
      }
      nameFilterTimer = null
    }, 2000)
  })

  sortOption.addEventListener('change', sortProducts)
}

function sortProducts() {
  const sortType = sortOption.selectedOptions[0]?.value

  switch (sortType) {
    case "PriceAsc": {
      filteredProducts = sortProductsByPrice(filteredProducts)
      break
    }

    case "PriceDesc": {
      filteredProducts = sortProductsByPrice(filteredProducts, -1)
      break
    }

    case "NameAsc": {
      filteredProducts = sortProductsByName(filteredProducts)
      break
    }

    case "NameDesc": {
      filteredProducts = sortProductsByName(filteredProducts, -1)
      break
    }

    default: {
      filteredProducts = sortProductsByRating(filteredProducts)
    }
  }

  loadProducts()
}

function capitalize(text) {
  if (!text) return text

  const splittedText = text.split(/[ ]+/)
  let first = true
  let capitalizedText = ""

  for (splitText of splittedText) {
    if (!first) {
      capitalizedText += " "
    }

    capitalizedText += splitText.substr(0, 1).toUpperCase() + splitText.substr(1).toLowerCase()
    first = false
  }

  return capitalizedText
}

function loading(status) {
  const loading = document.querySelector('div.spinner-container')

  if (status) {
    loading.style.display = 'block'
  } else {
    loading.style.display = 'none'
  }
}

function loadProducts() {
  catalog.innerHTML = "";
  filteredProducts.forEach(loadProduct)
}

function sortProductsByRating(products, order = -1) {
  return products.sort((p1, p2) => ((p1.rating??0)*10 - (p2.rating??0)*10) * order)
}

function sortProductsByName(products, order = 1) {
  return products.sort((p1, p2) => (p1.name??'').localeCompare(p2.name??'') * order)
}

function sortProductsByPrice(products, order = 1) {
  return products.sort((p1, p2) => ((p1.price??0)*100 - (p2.price??0)*100) * order)
}

function loadBrandsFilter(brandsList) {
  brandsList.forEach(brand => {
    brandFilter.appendChild(new Option(capitalize(brand), brand.toLowerCase()))
  })

  brandFilter.addEventListener('change', filterProducts)
}

function loadTypesFilter(typesList) {
  typesList.forEach(type => {
    typeFilter.appendChild(new Option(capitalize(type), type.toLowerCase()))
  })

  typeFilter.addEventListener('change', filterProducts)
}

//EXEMPLO DO CÓDIGO PARA UM PRODUTO
function loadProduct(product) {
  catalog.innerHTML += 
  `<div class="product" data-name="${product.name}" data-brand="${product.brand}" data-type="${product.type}" tabindex="508">
    <figure class="product-figure">
      <img src="${product.image_link}" width="215" height="215" alt="${product.name}" onerror="javascript:this.src='img/unavailable.png'">
    </figure>
    <section class="product-description">
      <h1 class="product-name">${product.name}</h1>
      <div class="product-brands">
        <span class="product-brand background-brand">${product.brand}</span>
        <span class="product-brand background-price">${currencyFormatter.format(product.price*5.5)}</span>
        <span class="product-brand">${product.rating}</span>
      </div>
    </section>
  </div>`
}

function filterProducts() {
  const name = nameFilter.value
  const brand = brandFilter.selectedOptions[0]?.value
  const type = typeFilter.selectedOptions[0]?.value

  filteredProducts = allProducts

  if (name) {
    filteredProducts = filteredProducts.filter(p => p.name.includes(name))
  }

  if (brand) {
    filteredProducts = filteredProducts.filter(p => p.brand == brand)
  }

  if (type) {
    filteredProducts = filteredProducts.filter(p => p.product_type == type)
  }

  sortProducts()
  loadProducts()
}

function filterProductsByType(type) {
  if (type) {
    filteredProducts = allProducts.filter(p => p.product_type == type)
    loadProducts()
  }
}

//EXEMPLO DO CÓDIGO PARA OS DETALHES DE UM PRODUTO
function loadDetails(product) {
  let details = `<section class="product-details"><div class="details-row">
        <div>Brand</div>
        <div class="details-bar">
          <div class="details-bar-bg" style="width= 250">nyx</div>
        </div>
      </div><div class="details-row">
        <div>Price</div>
        <div class="details-bar">
          <div class="details-bar-bg" style="width= 250">10.49</div>
        </div>
      </div><div class="details-row">
        <div>Rating</div>
        <div class="details-bar">
          <div class="details-bar-bg" style="width= 250">5</div>
        </div>
      </div><div class="details-row">
        <div>Category</div>
        <div class="details-bar">
          <div class="details-bar-bg" style="width= 250"></div>
        </div>
      </div><div class="details-row">
        <div>Product_type</div>
        <div class="details-bar">
          <div class="details-bar-bg" style="width= 250">bronzer</div>
        </div>
      </div></section>`;
}
