import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import {
  useLocalStorageState,
  useSessionStorageState,
} from '@tanstack/react-persister/storage-persister'

// App2: useLocalStorageState hook
function App2() {
  const [todos, setTodos] = useLocalStorageState(
    'todos-list',
    [] as Array<string>,
  )
  const [newTodo, setNewTodo] = useState('')

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos((prev) => [...prev, newTodo.trim()])
      setNewTodo('')
    }
  }

  const removeTodo = (index: number) => {
    setTodos((prev) => prev.filter((_, i) => i !== index))
  }

  const clearAll = () => {
    setTodos([])
  }

  return (
    <div
      style={{
        padding: '20px',
        border: '1px solid #ccc',
        marginBottom: '20px',
      }}
    >
      <h1>TanStack Persister useLocalStorageState Example</h1>
      <p>This example uses the useLocalStorageState hook for a todo list</p>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new todo"
            style={{ flex: 1, padding: '8px' }}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          />
          <button onClick={addTodo} style={{ padding: '8px 16px' }}>
            Add
          </button>
        </div>

        {todos.length > 0 && (
          <button
            onClick={clearAll}
            style={{
              padding: '4px 8px',
              fontSize: '0.9em',
              backgroundColor: '#ff6b6b',
              color: 'white',
              border: 'none',
            }}
          >
            Clear All
          </button>
        )}
      </div>

      <div>
        <h3>Todo List ({todos.length} items):</h3>
        {todos.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>
            No todos yet. Add one above!
          </p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {todos.map((todo, index) => (
              <li
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px',
                  marginBottom: '4px',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '4px',
                }}
              >
                <span>{todo}</span>
                <button
                  onClick={() => removeTodo(index)}
                  style={{
                    backgroundColor: '#ff4757',
                    color: 'white',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginTop: '20px', fontSize: '0.9em', color: '#666' }}>
        <p>• Todos persist in localStorage</p>
        <p>• Data survives browser refreshes</p>
        <p>• Shared across all tabs in the same domain</p>
      </div>
    </div>
  )
}

// App3: useSessionStorageState hook
function App3() {
  const [cart, setCart] = useSessionStorageState(
    'shopping-cart',
    [] as Array<{ id: number; name: string; quantity: number; price: number }>,
  )
  const [formData, setFormData] = useSessionStorageState('checkout-form', {
    email: '',
    address: '',
    city: '',
    zipCode: '',
  })

  const products = [
    { id: 1, name: 'Widget A', price: 19.99 },
    { id: 2, name: 'Widget B', price: 29.99 },
    { id: 3, name: 'Widget C', price: 39.99 },
  ]

  const addToCart = (product: (typeof products)[0]) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getTotalPrice = () => {
    return cart
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
      .toFixed(2)
  }

  return (
    <div
      style={{
        padding: '20px',
        border: '1px solid #ccc',
        marginBottom: '20px',
      }}
    >
      <h1>TanStack Persister useSessionStorageState Example</h1>
      <p>
        This example uses the useSessionStorageState hook for a shopping cart
      </p>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <h3>Products:</h3>
          {products.map((product) => (
            <div
              key={product.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px',
                marginBottom: '8px',
                backgroundColor: '#f9f9f9',
                borderRadius: '4px',
              }}
            >
              <span>
                {product.name} - ${product.price}
              </span>
              <button
                onClick={() => addToCart(product)}
                style={{
                  padding: '4px 12px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                }}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }}>
          <h3>Shopping Cart ({cart.length} items):</h3>
          {cart.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>Cart is empty</p>
          ) : (
            <>
              {cart.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px',
                    marginBottom: '4px',
                    backgroundColor: '#e8f5e8',
                    borderRadius: '4px',
                  }}
                >
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{
                      padding: '2px 8px',
                      backgroundColor: '#ff4757',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div
                style={{
                  marginTop: '10px',
                  padding: '10px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '4px',
                }}
              >
                <strong>Total: ${getTotalPrice()}</strong>
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Checkout Form:</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
          }}
        >
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            style={{ padding: '8px' }}
          />
          <input
            type="text"
            placeholder="Address"
            value={formData.address}
            onChange={(e) => updateFormData('address', e.target.value)}
            style={{ padding: '8px' }}
          />
          <input
            type="text"
            placeholder="City"
            value={formData.city}
            onChange={(e) => updateFormData('city', e.target.value)}
            style={{ padding: '8px' }}
          />
          <input
            type="text"
            placeholder="Zip Code"
            value={formData.zipCode}
            onChange={(e) => updateFormData('zipCode', e.target.value)}
            style={{ padding: '8px' }}
          />
        </div>
      </div>

      <div style={{ marginTop: '20px', fontSize: '0.9em', color: '#666' }}>
        <p>• Data persists in sessionStorage (only this tab)</p>
        <p>• Cart and form data cleared when tab is closed</p>
        <p>• Perfect for temporary shopping sessions</p>
      </div>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
    <App2 />
    <hr style={{ margin: '40px 0' }} />
    <App3 />
  </div>,
)
