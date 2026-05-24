export interface Product {
  id: string;
  ProductImages: Array<{
    productImageOne: string;
    productImageTwo: string;
  }>;
  // Add other required fields
}

export interface Business {
  id: string;
  uuid: string;
  businessName: string;
  businessEmail: string;
  businessPhoneNo: string;
  businessAddress: string;
  businessBiography: string;
  businessLogo: string;
  user: {
    name: string;
    url: string;
  };
}
