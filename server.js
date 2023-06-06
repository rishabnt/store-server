const express = require('express');
const cors = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    ); 
    next();
});

const stripe = require('stripe')('sk_test_51MnNkpSD2QjAlbAeJpzTZOUBX7kDk7pDoll78XzUmaB6vsyIxnzEMVCyzTKhoGyv29QYSVlBITRA2TxcAI8y5QeD002HR4Mz1G');

app.post('/checkout', async (req, res, next) => {
    try {      
        const session = await stripe.checkout.sessions.create({
            shipping_options: [
                {
                  shipping_rate_data: {
                    type: 'fixed_amount',
                    fixed_amount: {amount: 0, currency: 'inr'},
                    display_name: 'Free shipping',
                    delivery_estimate: {
                      minimum: {unit: 'business_day', value: 5},
                      maximum: {unit: 'business_day', value: 7},
                    },
                  },
                },
                {
                  shipping_rate_data: {
                    type: 'fixed_amount',
                    fixed_amount: {amount: 10000, currency: 'inr'},
                    display_name: '2-day Delivery',
                    delivery_estimate: {
                      minimum: {unit: 'business_day', value: 2},
                      maximum: {unit: 'business_day', value: 2},
                    },
                  },
                },
            ],
            line_items: req.body.items.map((item) => ({
                price_data: {
                    currency: 'inr', 
                    product_data: {
                        name: item.name,
                        images: [item.product]
                    }, 
                    unit_amount: item.price * 100
                },
                quantity: item.quantity,
            })), 
            mode: "payment",
            success_url: "http://localhost:4242/success.html",
            cancel_url: "http://localhost:4242/cancel.html"
        });        
        res
            .status(200)
            .json(session);
    } catch (error) {
        next(error);
    }
})

app.listen(4242, () => console.log('App is running on Port 4242.'))