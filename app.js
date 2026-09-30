import express from 'express';

const app = express();
const PORT = 3000;

// Permet à Express de lire les données JSON envoyées dans les requêtes
app.use(express.json());

let products = [
    {
        id: 1,
        name: "Pixel 10",
        category: "Phone",
        description: "test",
        price: 899
    }
];

// ==========================================
// 1. LISTER TOUS LES PRODUITS
// GET /products
// ==========================================

app.get('/products', (req, res) => {
    res.status(200).json(products);
});

// ==========================================
// 2. CONSULTER UN PRODUIT
// GET /products/:id
// ==========================================

app.get('/products/:id', (req, res) => {
    const id = Number(req.params.id);

    const product = products.find(product => product.id === id);

    if (!product) {
        return res.status(404).json({
            message: "Produit introuvable"
        });
    }

    res.status(200).json(product);
});

// ==========================================
// 3. AJOUTER UN PRODUIT
// POST /products
// ==========================================

app.post('/products', (req, res) => {
    const { name, description, price, category } = req.body;

    // Vérification des champs obligatoires
    if (!name || !description || price === undefined || !category) {
        return res.status(400).json({
            message: "Les champs name, description, price et category sont obligatoires"
        });
    }

    const newProduct = {
        id: products.length > 0
            ? Math.max(...products.map(product => product.id)) + 1
            : 1,
        name,
        description,
        price,
        category
    };

    products.push(newProduct);

    res.status(201).json(newProduct);
});

// ==========================================
// 4. MODIFIER PARTIELLEMENT UN PRODUIT
// PATCH /products/:id
// ==========================================

app.patch('/products/:id', (req, res) => {
    const id = Number(req.params.id);

    const product = products.find(product => product.id === id);

    if (!product) {
        return res.status(404).json({
            message: "Produit introuvable"
        });
    }

    const { name, description, price, category } = req.body;

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (category !== undefined) product.category = category;

    res.status(200).json(product);
});

// ==========================================
// 5. REMPLACER COMPLÈTEMENT UN PRODUIT
// PUT /products/:id
// ==========================================

app.put('/products/:id', (req, res) => {
    const id = Number(req.params.id);

    const index = products.findIndex(product => product.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Produit introuvable"
        });
    }

    const { name, description, price, category } = req.body;

    if (!name || !description || price === undefined || !category) {
        return res.status(400).json({
            message: "Les champs name, description, price et category sont obligatoires"
        });
    }

    const updatedProduct = {
        id,
        name,
        description,
        price,
        category
    };

    products[index] = updatedProduct;

    res.status(200).json(updatedProduct);
});

// ==========================================
// 6. SUPPRIMER UN PRODUIT
// DELETE /products/:id
// ==========================================

app.delete('/products/:id', (req, res) => {
    const id = Number(req.params.id);

    const index = products.findIndex(product => product.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Produit introuvable"
        });
    }

    products.splice(index, 1);

    res.status(204).send();
});
app.listen(3000);