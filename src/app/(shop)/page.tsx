"use client";

import Image from "next/image";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Link from "next/link";
import { useState, useEffect } from "react";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase-config";

// Types
interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string | null;
  role: "customer" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  stock: number;
  categoryId: string;
  categoryName?: string;
  images: ProductImage[];
  featured: boolean;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  order: number;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [adminWhatsApp, setAdminWhatsApp] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Fetch admin WhatsApp number
  const fetchAdminWhatsApp = async () => {
    try {
      const usersRef = collection(db, "users");
      const adminQuery = query(usersRef, where("role", "==", "admin"));
      const adminSnapshot = await getDocs(adminQuery);
      
      if (!adminSnapshot.empty) {
        const adminData = adminSnapshot.docs[0].data() as User;
        if (adminData.phoneNumber) {
          // Format phone number for WhatsApp (remove + and spaces)
          const formattedNumber = adminData.phoneNumber.replace(/[\s+-]/g, "");
          setAdminWhatsApp(formattedNumber);
        }
      }
    } catch (error) {
      console.error("Error fetching admin WhatsApp:", error);
    }
  };

  // Fetch products from Firestore
  const fetchProducts = async () => {
    try {
      const productsRef = collection(db, "products");
      
      // Fetch featured products for "New Collection" section
      const featuredQuery = query(
        productsRef,
        where("featured", "==", true),
        where("available", "==", true),
        orderBy("createdAt", "desc"),
        limit(3)
      );
      const featuredSnapshot = await getDocs(featuredQuery);
      const featuredProductsData = featuredSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Product[];
      setFeaturedProducts(featuredProductsData);

      // Fetch all available products for "Our Products" section
      const allQuery = query(
        productsRef,
        where("available", "==", true),
        orderBy("createdAt", "desc"),
        limit(6)
      );
      const allSnapshot = await getDocs(allQuery);
      const allProductsData = allSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Product[];
      setProducts(allProductsData);

    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminWhatsApp();
    fetchProducts();
  }, []);

  // Format price to Indonesian Rupiah
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Handle WhatsApp contact
  const handleWhatsAppContact = () => {
    if (adminWhatsApp) {
      const message = encodeURIComponent("Halo, saya ingin bertanya tentang produk modest fashion Anda.");
      window.open(`https://wa.me/${adminWhatsApp}?text=${message}`, "_blank");
    } else {
      alert("Nomor WhatsApp admin tidak tersedia saat ini.");
    }
  };

  return (
    <main className="bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-[#F3F3F3] py-12">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between">
          <div className="max-w-xl space-y-4">
            <h1 className="text-4xl font-bold text-[#1C1501]">
              Modest Fashion
            </h1>
            <p className="text-[#1C1521]">
              Discover your personal style through a curated collection that radiates the beauty and character of the modern woman.
            </p>
            <Link href="/products">
              <button className="inline-flex items-center gap-2 px-6 py-2 mt-4 text-white bg-[#1C1501] hover:bg-black transition rounded-xl shadow-md">
                Explore Now
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="white"
                  viewBox="0 0 24 24"
                >
                  <path d="M10 2a8 8 0 106.32 12.906l4.387 4.387 1.414-1.414-4.387-4.387A8 8 0 0010 2zm0 2a6 6 0 110 12A6 6 0 0110 4z" />
                </svg>
              </button>
            </Link>
          </div>

          <div className="relative mt-10 md:mt-0 w-[300px] h-[400px]">
            <div className="absolute inset-0 bg-yellow-400 rounded-[60px] z-0" />
            <Image
              src="/model.png"
              alt=""
              fill
              className="relative z-10 object-cover rounded-[60px]"
            />
            <div className="absolute top-5 right-6 z-20 grid grid-cols-3 gap-1">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="w-1 h-1 bg-black rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Booking & Contact */}
      <section className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-center items-stretch gap-4 text-center">
            <Link href="/booking" className="flex-1 max-w-xs">
              <div className="p-4 border rounded-md text-[#1C1501] text-sm flex items-center justify-center gap-2 bg-[#F9F9F9] hover:bg-gray-100 transition cursor-pointer h-full">
                <i className="fas fa-calendar-alt text-yellow-500"></i>
                🏠︎ Booking An Appointment
              </div>
            </Link>
            <button 
              onClick={handleWhatsAppContact}
              className="flex-1 max-w-xs p-4 border rounded-md text-[#1C1501] text-sm flex items-center justify-center gap-2 bg-[#F9F9F9] hover:bg-gray-100 transition cursor-pointer"
            >
              <i className="fas fa-phone-alt text-yellow-500"></i>
              ☎ Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* New Collection */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <h2 className="text-2xl font-bold mb-2 text-[#1C1501]">New Collection</h2>
          <p className="text-[#1C1521] mb-10">Concept Fashion Phinisi Sunset</p>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-left">
                {featuredProducts.length > 0 ? (
                  featuredProducts.map((product) => (
                    <Link key={product.id} href={`/products/${product.slug}`}>
                      <div className="w-full bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition cursor-pointer">
                        <div className="relative aspect-[4/5] w-full">
                          <Image
                            src={product.images[0]?.url || "/placeholder-product.jpg"}
                            alt={product.images[0]?.alt || product.name}
                            fill
                            className="object-cover rounded-t-xl"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-30 rounded-t-xl" />
                        </div>
                        <div className="p-4 space-y-2">
                          <div className="flex justify-between items-center text-[#1C1501] font-semibold">
                            <span className="truncate">{product.name}</span>
                            <span className="text-right text-[#A67C52] whitespace-nowrap ml-2">
                              {formatPrice(product.basePrice)}
                            </span>
                          </div>
                          <p className="text-sm text-[#888]">{product.categoryName || "Fashion"}</p>
                          <div className="flex items-center gap-1 text-sm text-[#888]">
                            <span className="text-[#F7C100]">⭐</span>
                            <span>4.5/5</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  // Fallback to static data if no featured products
                  [
                    {
                      src: "/images/koleksi_terbaru1.jpg",
                      nama: "Salsabila Aurora Dress",
                      harga: "Rp 750.000",
                      kategori: "Wedding",
                      rating: "4.5/5",
                    },
                    {
                      src: "/images/koleksi_terbaru2.jpg",
                      nama: "Nayla Voyage Set",
                      harga: "Rp 520.000",
                      kategori: "Formal",
                      rating: "4.8/5",
                    },
                    {
                      src: "/images/koleksi_terbaru3.jpg",
                      nama: "Aluna Breeze Tunic",
                      harga: "Rp 590.000",
                      kategori: "Casual",
                      rating: "4.6/5",
                    },
                  ].map((item, i) => (
                    <div key={i} className="w-full bg-white rounded-xl overflow-hidden shadow-md">
                      <div className="relative aspect-[4/5] w-full">
                        <Image
                          src={item.src}
                          alt={item.nama}
                          fill
                          className="object-cover rounded-t-xl"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-30 rounded-t-xl" />
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex justify-between items-center text-[#1C1501] font-semibold">
                          <span>{item.nama}</span>
                          <span className="text-right text-[#A67C52]">{item.harga}</span>
                        </div>
                        <p className="text-sm text-[#888]">{item.kategori}</p>
                        <div className="flex items-center gap-1 text-sm text-[#888]">
                          <span className="text-[#F7C100]">⭐</span>
                          <span>{item.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Link href="/products">
                <button className="px-6 py-2 border border-yellow-400 text-yellow-500 rounded-full text-sm font-medium inline-flex items-center gap-2 hover:bg-yellow-50 transition">
                  View All
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M13.172 12l-4.95-4.95 1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" />
                  </svg>
                </button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Our Products */}
      <section className="bg-[#F9F9F9] py-12">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <h2 className="text-2xl font-bold text-[#1C1501] mb-2">Our Products</h2>
          <p className="text-[#1C1521] mb-10">Discover our finest product selections for every occasion</p>

          <div className="flex justify-center gap-8 mb-10 font-semibold text-[#8B8686] text-sm">
            <button className="hover:text-black transition">DISCOUNT</button>
            <button className="text-black relative">
              POPULAR
              <span className="block mx-auto mt-1 h-1 w-6 bg-black rounded-full"></span>
            </button>
            <button className="hover:text-black transition">NEW PRODUCT</button>
            <button className="hover:text-black transition">ACCESSORIES</button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 text-left">
                {products.length > 0 ? (
                  products.map((product) => (
                    <Link key={product.id} href={`/products/${product.slug}`}>
                      <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition cursor-pointer">
                        <div className="relative aspect-[4/5] w-full">
                          <Image
                            src={product.images[0]?.url || "/placeholder-product.jpg"}
                            alt={product.images[0]?.alt || product.name}
                            fill
                            className="object-cover rounded-t-xl"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-30 rounded-t-xl" />
                        </div>
                        <div className="p-4 space-y-2">
                          <div className="flex justify-between items-center text-[#1C1501] font-semibold">
                            <span className="truncate">{product.name}</span>
                            <span className="text-[#A67C52] whitespace-nowrap ml-2">
                              {formatPrice(product.basePrice)}
                            </span>
                          </div>
                          <p className="text-sm text-[#888]">{product.categoryName || "Fashion"}</p>
                       
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  // Fallback to static data if no products
                  [
                    {
                      src: "/images/produk_kami1.jpeg",
                      nama: "Kalila Bloom Set",
                      harga: "Rp 680.000",
                      kategori: "Traditional",
                    },
                    {
                      src: "/images/produk_kami2.jpeg",
                      nama: "Abaya Nayyara Luxe",
                      harga: "Rp 740.000",
                      kategori: "Formal",
                    },
                    {
                      src: "/images/produk_kami3.jpeg",
                      nama: "Nadira Ethnica Kebaya",
                      harga: "Rp 890.000",
                      kategori: "Wedding",
                    },
                    {
                      src: "/images/produk_kami4.jpeg",
                      nama: "Purple Robe",
                      harga: "Rp 560.000",
                      kategori: "Casual",
                    },
                    {
                      src: "/images/produk_kami5.jpeg",
                      nama: "Plain Dress",
                      harga: "Rp 720.000",
                      kategori: "Semi Formal",
                    },
                    {
                      src: "/images/produk_kami6.jpeg",
                      nama: "Batik Tunic",
                      harga: "Rp 630.000",
                      kategori: "Batik",
                    },
                  ].map((item, i) => (
                    <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md">
                      <div className="relative aspect-[4/5] w-full">
                        <Image
                          src={item.src}
                          alt={item.nama}
                          fill
                          className="object-cover rounded-t-xl"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-30 rounded-t-xl" />
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex justify-between items-center text-[#1C1501] font-semibold">
                          <span>{item.nama}</span>
                          <span className="text-[#A67C52]">{item.harga}</span>
                        </div>
                        <p className="text-sm text-[#888]">{item.kategori}</p>
                        <div className="flex items-center gap-1 text-sm text-[#888]">
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Link href="/products">
                <button className="mt-10 px-6 py-2 border border-yellow-400 text-yellow-500 rounded-full text-sm font-medium inline-flex items-center gap-2 hover:bg-yellow-50 transition">
                  View All
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M13.172 12l-4.95-4.95 1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" />
                  </svg>
                </button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Exclusive Designer Outfits for You */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <h2 className="text-2xl font-bold mb-10 text-[#1C1501]">
            Exclusive Designer Outfits for You
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                src: "/images/pakaian_desainer1.jpg",
                title: "Dress",
                description: "An elegant dress with a modern cut, perfect for both formal and casual occasions.",
              },
              {
                src: "/images/pakaian_desainer2.jpg",
                title: "Accessories",
                description: "Unique accessories to complete your style, from bags to luxurious jewelry.",
              },
              {
                src: "/images/pakaian_desainer3.jpg",
                title: "Outerwear",
                description: "A stylish outerwear collection designed to provide the perfect finishing touch.",
              },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="relative rounded-xl overflow-hidden">
                  <Image
                    src={item.src}
                    alt={item.title}
                    width={250}
                    height={300}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30" />
                </div>
                <h3 className="text-lg font-semibold mt-4 text-[#1C1501]">
                  {item.title}
                </h3>
                <p className="text-sm text-[#888888]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-[#DDDDDD] py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-yellow-400 inline-block px-4 py-2 rounded-full text-sm font-semibold text-black shadow-sm">
            Why Choose Us?
          </div>
          <p className="mt-6 text-[#333333] text-sm leading-relaxed max-w-xl mx-auto">
            In our business operations, we implement a sustainable system by using traditional textiles (wastra) from South Sulawesi, which indirectly supports the local weavers and producers. Additionally, our workforce consists of vocational school graduates and housewives. Fabric waste from production is sorted to separate usable scraps that can be turned into new products or donated to craft-based MSMEs as a way to contribute to environmental preservation.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}