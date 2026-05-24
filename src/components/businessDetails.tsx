import React from 'react';

interface BusinessDetailsProps {
  name: string;
  email: string;
  phone: number;
  address: string;
  biography: string;
}

const BusinessDetails: React.FC<BusinessDetailsProps> = ({ name, email, phone, address, biography }) => {
  return (
    <div className="w-full lg:w-2/3 space-y-4">
      <h1 className="text-3xl font-semibold text-black">{name}</h1>
      <p className="text-md text-yellow-300">Contact: <span className="font-bold text-gray-700"> {email}</span></p>
      <p className="text-md text-yellow-300">Phone: <span className="font-bold text-gray-700"> {phone}</span></p>
      <p className="text-md text-yellow-300">Address: <span className="font-bold text-gray-700"> {address}</span></p>
      <p className="text-md text-gray-600 truncate">{biography}</p>
    </div>
  );
};

export default BusinessDetails;
