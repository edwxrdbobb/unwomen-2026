"use client";

import { useParams } from 'next/navigation'; // Import useParams hook
// import { useEffect, useState } from 'react';
import Shop from "../../../page"


const BusinessCategoryProducts: React.FC = (): JSX.Element =>{


// interface Category {
//   category: string;
// }

// interface ShopProps {
//   category: string | string[]; 
// }

const params = useParams(); 
const category = params.id; // Ensure you are accessing the correct parameter

console.log(category); // Check if category is logged correctly

if (!category) {
    
  return <p>Loading product...</p>;
}
return(
    <div>
        <Shop size={2} action="business" category={category} /> {/* Pass action if needed */}
    </div>
)
}

export default BusinessCategoryProducts;
