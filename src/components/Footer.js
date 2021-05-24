import React from 'react'
import './Footer.css'

export default () => (
  <div>
    <h2 className="taCenter">
      Follow us{' '}
      <a href="https://">here</a>
    </h2>
    <br />
    <footer className="footer">
      <div className="container taCenter">
        <span>
          shellyeah {new Date().getFullYear()} All rights reserved. Crafted by{' '}
          <a href="https://">shellyeah</a>.
        </span>
      </div>
    </footer>
  </div>
)
