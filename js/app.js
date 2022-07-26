const api = 'https://makeup-api.herokuapp.com/api/v1/products.json'
//const api = 'http://localhost:8080/data/products.json'
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

init()

function init() {
  loading(true)

  fetch(api)
  .then(res => res.json())
  .then(sortProductsByRating)
  .then(products => {
    products.forEach(p => p.name = p.name.trim())

    allProducts = products

    console.log('loading...')

    loadProducts()
    console.log('loaded products')

    loadBrandsFilter(products.map(p => p.brand).filter(unique).sort())
    console.log('loaded brands filter')

    loadTypesFilter(products.map(p => p.product_type).filter(unique).sort())
    console.log('loaded types filter')

    loading(false)
  })
  .catch(err => {
    console.err(err)
    alert('Error loading products. For more details, check console log.')

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
    }, 500)
  })

  sortOption.addEventListener('change', sortProducts)

  console.log('initialized')
}

function sortProducts() {
  const sortType = sortOption.selectedOptions[0]?.value

  switch (sortType) {
    case 'PriceAsc': {
      allProducts = sortProductsByPrice(allProducts)
      break
    }

    case 'PriceDesc': {
      allProducts = sortProductsByPrice(allProducts, -1)
      break
    }

    case 'NameAsc': {
      allProducts = sortProductsByName(allProducts)
      break
    }

    case 'NameDesc': {
      allProducts = sortProductsByName(allProducts, -1)
      break
    }

    default: {
      allProducts = sortProductsByRating(allProducts)
    }
  }

  updateProductsOrder()
}

function updateProductsOrder() {
  for (let i = 0; i < allProducts.length; i++) {
    document.querySelector(`div.product[tabindex="${allProducts[i].id}"]`).style.order = i
  }
}

function capitalize(text) {
  if (!text) return text

  const splittedText = text.split(/[ ]+/)
  let first = true
  let capitalizedText = ''

  for (splitText of splittedText) {
    if (!first) {
      capitalizedText += ' '
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
  catalog.innerHTML = allProducts.map(loadProduct).join('')
}

function sortProductsByRating(products, order = -1) {
  return products.sort((p1, p2) => ((p1.rating ?? 0)*10 - (p2.rating ?? 0)*10) * order)
}

function sortProductsByName(products, order = 1) {
  return products.sort((p1, p2) => (p1.name ?? '').localeCompare(p2.name ?? '') * order)
}

function sortProductsByPrice(products, order = 1) {
  return products.sort((p1, p2) => ((p1.price ?? 0)*100 - (p2.price ?? 0)*100) * order)
}

function loadBrandsFilter(brandsList) {
  brandsList.forEach(brand => {
    brandFilter.appendChild(new Option(brand, brand.toLowerCase()))
  })

  brandFilter.addEventListener('change', filterProducts)
}

function loadTypesFilter(typesList) {
  typesList.forEach(type => {
    typeFilter.appendChild(new Option(type, type.toLowerCase()))
  })

  typeFilter.addEventListener('change', filterProducts)
}

function filterProducts() {
  const name = nameFilter.value
  const brand = brandFilter.selectedOptions[0]?.value
  const type = typeFilter.selectedOptions[0]?.value

  document.querySelectorAll('div.product').forEach(e => e.style.display = 'none')

  let filter = ''

  if (name) {
    filter += `[data-name*="${name}"]`
  }

  if (brand) {
    filter += `[data-brand="${brand}"]`
  }

  if (type) {
    filter += `[data-type="${type}"]`
  }

  if (filter) {
    document.querySelectorAll('div.product').forEach(e => e.style.display = 'none')
    document.querySelectorAll(`div.product${filter}`).forEach(e => e.style.display = 'block')
  } else {
    document.querySelectorAll('div.product').forEach(e => e.style.display = 'block')
  }
}

function loadProduct(product) {
  let productHTML = 
  `<div class="product" data-name="${product.name.toLowerCase()}" data-brand="${product.brand}" data-type="${product.product_type}" tabindex="${product.id}">
    <figure class="product-figure">
      <img src="${product.image_link}" width="215" height="215" alt="${product.name}" onerror="javascript:this.src='img/unavailable.png'">
    </figure>
    <section class="product-description">
      <h1 class="product-name">${product.name}</h1>
      <div class="product-brands">
        <span class="product-brand background-brand" ${!product.brand ? 'style="display:none"' : ''}>${product.brand ?? ''}</span>
        <span class="product-brand background-price">${currencyFormatter.format(product.price*5.5)}</span>
      </div>
    </section>
    ${loadProductDetails(product)}
  </div>`

  return productHTML
}

function loadProductDetails(product) {
  let details = 
  `<section class="product-details">
    <div class="details-row">
      <div>Brand</div>
      <div class="details-bar">
        <div class="details-bar-bg">${product.brand ?? '&nbsp;'}</div>
      </div>
    </div>
    <div class="details-row">
      <div>Price</div>
      <div class="details-bar">
        <div class="details-bar-bg">${product.price}</div>
      </div>
    </div>
    <div class="details-row">
      <div>Rating</div>
      <div class="details-bar">
        <div class="details-bar-bg">${product.rating ?? '&nbsp;'}</div>
      </div>
    </div>
    <div class="details-row">
      <div>Category</div>
      <div class="details-bar">
        <div class="details-bar-bg">${product.category ?? '&nbsp;'}</div>
      </div>
    </div>
    <div class="details-row">
      <div>Product Type</div>
      <div class="details-bar">
        <div class="details-bar-bg">${product.product_type ?? '&nbsp;'}</div>
      </div>
    </div>
  </section>`

  return details
}
