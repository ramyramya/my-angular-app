/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = function (knex) {
  return knex('vendors')
    .del()
    .then(function () {
      return knex('vendors').insert([
        { vendor_name: 'TechStore', contact_name: 'John Doe', address: '123 Tech Street', city: 'Tech City', postal_code: '12345', country: 'USA', phone: '123-456-7890', status: 1 },
        { vendor_name: 'FashionHub', contact_name: 'Jane Smith', address: '456 Fashion Avenue', city: 'Fashion City', postal_code: '67890', country: 'USA', phone: '987-654-3210', status: 1 },
        { vendor_name: 'HomeDecor', contact_name: 'Alice Brown', address: '789 Decor Lane', city: 'Decor Town', postal_code: '11223', country: 'USA', phone: '456-123-7890', status: 1 },
        { vendor_name: 'GardenWorld', contact_name: 'Bob Green', address: '321 Garden Street', city: 'Green City', postal_code: '33445', country: 'USA', phone: '789-456-1230', status: 1 },
        { vendor_name: 'ApplianceMart', contact_name: 'Chris Blue', address: '987 Appliance Ave', city: 'Utility City', postal_code: '55678', country: 'USA', phone: '123-987-6543', status: 1 },
        { vendor_name: 'GadgetGuru', contact_name: 'David White', address: '654 Gadget Blvd', city: 'Innovation Town', postal_code: '66789', country: 'USA', phone: '321-654-0987', status: 1 },
        { vendor_name: 'OutdoorGear', contact_name: 'Eve Black', address: '159 Outdoor Rd', city: 'Adventure City', postal_code: '77890', country: 'USA', phone: '456-789-1234', status: 1 },
        { vendor_name: 'MusicCenter', contact_name: 'Frank Purple', address: '753 Music Lane', city: 'Melody Town', postal_code: '88901', country: 'USA', phone: '987-123-4567', status: 1 },
        { vendor_name: 'WellnessShop', contact_name: 'Grace Gray', address: '951 Health Way', city: 'Fitness City', postal_code: '99012', country: 'USA', phone: '654-321-9876', status: 1 },
        { vendor_name: 'PetCarePlus', contact_name: 'Hank Green', address: '852 Pet Street', city: 'Petville', postal_code: '11223', country: 'USA', phone: '789-654-3210', status: 1 },
      ]);
    });
};
