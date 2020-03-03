const brands = ['Acura', 'Alfa Romeo', 'Aston Martin', 'Audi', 'Bentley', 'BMW', 'Bugatti', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler', 'Citroen', 'Dodge', 'Ferrari', 'Fiat', 'Ford', 'Geely', 'General Motors', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Jaguar', 'Jeep', 'Kia', 'Koenigsegg', 'Lamborghini', 'Land Rover', 'Lexus', 'Maserati', 'Mazda', 'McLaren', 'Mercedes-Benz', 'Mini2', 'Mitsubishi', 'Nissan', 'Pagani', 'Peugeot', 'Porsche', 'Ram', 'Renault', 'Rolls Royce', 'Saab', 'Subaru', 'Suzuki', 'Tata Motors', 'Tesla', 'Toyota', 'Volkswagen'];
const names = ['Jack', 'Thomas', 'Joshua', 'William', 'Daniel', 'Matthew', 'James', 'Joseph', 'Harry', 'Samuel'];
const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'violet', 'purple'];

export default function carsGenerator(count) {
  const res = [];

  for (let i = 0; i < count; ++i) {
    res.push({
      id: i + 1,
      brand: brands[Math.floor(Math.random() * brands.length)],
      owner: names[Math.floor(Math.random() * names.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }

  return res;
}
