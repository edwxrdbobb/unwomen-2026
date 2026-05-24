import React from 'react';
import Image from 'next/image';
import loader from '@/images/SVGs/loader.svg'

const Loader: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-64">
      <Image src={loader} alt='Loading...' width={400} height={400} className="w-16 h-16" />
    </div>
  );
};

export default Loader;
