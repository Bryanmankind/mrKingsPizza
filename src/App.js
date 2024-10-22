import { useState } from 'react';
import './App.css';
import { pizzaOrders } from './pizzaOrders';
import {FlutterWaveButton, closePaymentModal } from 'flutterwave-react-v3';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faCrown} from '@fortawesome/free-solid-svg-icons';

function App() {
  const [foodItems] = useState(pizzaOrders);
  const [selectedPizza, setSelectedPizza] = useState(null);
  const [showOrder, setShowOrder] = useState(false);

  // Handles selecting a pizza and toggling the order page visibility
  function handleSelectedPizza(pizza) {
      setSelectedPizza(pizza);
      setShowOrder(true); 
  }

  // Hides the order page
  function handleHideOrder() {
    setShowOrder(false);
    setSelectedPizza(null); // Reset selected pizza to close order page
  }

  return (
    <div className='app'>
      <Navbar />
      <div className='app_foodItems'>
        {/* Pass state and handlers to the FoodItems component */}
        <FoodItems foodItems={foodItems} selectedPizza={selectedPizza} onSelect={handleSelectedPizza} />

        {/* Render the Orders component if a pizza is selected and showOrder is true */}
        {selectedPizza && showOrder && (
          <>
            {/* Background Overlay to close order page when clicked */}
            <div className={`overlay ${showOrder ? 'show' : ''}`} onClick={handleHideOrder}></div>

            {/* Orders component */}
            <Orders selectedPizza={selectedPizza} onClose={handleHideOrder} foodItems={foodItems}/>
          </>
        )}
      </div>
    </div>
  );
}

function Navbar() {
  return (
    <nav className='nav-bar'>
      <FontAwesomeIcon icon={faCrown} className="nav-icon"/>
      <h1>Mr Kings Pizza</h1>
      <ul className='nav-list'>
        <li>
          <a>SignUp</a>
          <a>About</a>
        </li>
      </ul>
    </nav>
  );
}

function FoodItems({ foodItems, onSelect}) {
  return (
    <div className='food_Items'>
      <ul className='food_list'>
        {/* Render food items */}
        {foodItems.map((food) => (
          <ListFood food={food} key={food.name} onSelect={onSelect} />
        ))}
      </ul>
    </div>
  );
}

function ListFood({ food, onSelect }) {
  return (
    <li>
      <img src={food.photoName} alt="" />
      <h3>{food.name}</h3>
      <p>{food.ingredients}</p>
      <div className='but-right'>
        <button>NGN {food.price}</button>
        {/* Pass the selected food to the handler when the order button is clicked */}
        <button className='button' onClick={() => onSelect(food)}>Order</button>
      </div>
    </li>
  );
}

function Orders({selectedPizza, onClose, foodItems}) {
  const [quantity, setQuantity] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(foodItems.findIndex(pizza => pizza.name === selectedPizza.name));
  const [orderList, setOrderList] = useState([]);
  const [totalOrderAmount, setTotalOrderAmount] = useState(0);
  const totalAmount = quantity * foodItems[currentIndex].price; 

  function handlePrevious () {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }
  
  function handelNext () {
    if (currentIndex < foodItems.length - 1){
      setCurrentIndex(currentIndex + 1);
    }
  }

  function handelOrderList () {
    const newOrder = {
      name: foodItems[currentIndex].name,
      quantity,
      total: totalAmount
    }
    setOrderList([...orderList, newOrder]);

    setTotalOrderAmount(totalOrderAmount + totalAmount);
  }

  function handleRemoveOrder(indexToRemove) {
    setOrderList(orderList.filter((_, index) => index !== indexToRemove));
    const removedOrderTotal = orderList[indexToRemove].total;

    setTotalOrderAmount(totalOrderAmount - removedOrderTotal);
  }
  const fwConfig = {
    public_key: process.env.REACT_APP_PUBLIC_KEY,
    tx_ref: Date.now(),
    amount: totalOrderAmount,
    currency: 'NGN',
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email: 'user@gmail.com',
      phone_number: '070********',
      name: 'john doe',
    },
    customizations: {
      title: 'My store',
      description: 'Payment for items in cart',
      logo: 'https://st2.depositphotos.com/4403291/7418/v/450/depositphotos_74189661-stock-illustration-online-shop-log.jpg',
    },
    text: 'Make Payment',
    callback: (response) => {
      console.log(response);
      closePaymentModal(); // Close the payment modal programmatically
      alert('Payment Successful!');
    },
    onClose: () => {
      console.log('Payment closed');
    },
  };

  return (
    <div className='make_order show'>
        <h2>The Kings</h2>
      <div className='displayPizza'>
        <div className='displayPizza-row'>
        <button onClick={handlePrevious} disabled={currentIndex === 0} bgColor="#7950f2" textColor="#fff"><span>👈</span> Previous </button>
        <h3> Order for {foodItems[currentIndex].name}</h3>
        <button onClick={handelNext} disabled={currentIndex === foodItems.length - 1} bgColor="#7950f2" textColor="#fff">Next<span>👉</span>  </button>
        </div>
         <img src={foodItems[currentIndex].photoName} alt="foodItems.photoName" />
      </div>
       <div className="orderQuantity"> 
       <label >Quantity</label>
        <select name="orderQuantity"  value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}>
         {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
          <option value={num} key={num}>{num}</option>
           ))}
        </select>

       <label>Total Amount</label>
       <input type="text" disabled value={`NGN ${totalAmount}`}/>

        <button onClick={handelOrderList}>Add To Order</button>
       </div>
       <div className='orderList'>
      <h3>Order List:</h3>
      <ul>
        {orderList.map((order, index) => (
          <li key={index}>
            {order.quantity} {order.name} - NGN {order.total}
            <button onClick={() => handleRemoveOrder(index)}>❌</button>
          </li>
        ))}
      </ul>
       </div>
      <h3>Total Order Amount: NGN {totalOrderAmount}</h3>
      <FlutterWaveButton {...fwConfig} />
      
      <button onClick={onClose} className='close-button'>Close</button>
    </div>
  );
}

export default App;
