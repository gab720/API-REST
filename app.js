import express from 'express';

const product = [
    {
        id: 1,
        name: "Pixel 10",
        category: "Phone",
        description: "test"
    },

];

const app = express()

app.get('/products', (req, res) => {
    res.send(product);
});

app.listen(3000);