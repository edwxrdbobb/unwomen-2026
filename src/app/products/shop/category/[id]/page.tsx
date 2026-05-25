"use client";

import { useParams } from 'next/navigation'; // Import useParams hook
// import { useEffect, useState } from 'react';
import Shop from "../../page"


const CategoryProducts: React.FC = (): JSX.Element =>{


// interface Category {
//   category: string;
// }

// interface ShopProps {
//   category: string | string[]; 
// }

const params = useParams();
const raw = params.id;
const category = Array.isArray(raw)
  ? decodeURIComponent(raw[0])
  : decodeURIComponent(raw ?? '')

if (!category) return <p>Loading product...</p>

return (
  <div>
    <Shop size={4} action="category" category={category} />
  </div>
)
}

export default CategoryProducts;
