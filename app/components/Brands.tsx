import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../components/ui/carousel";

import Image from "next/image";

const Brands = () => {
  const Brands = [
    {
      id: 1,
      ImageURL: "/images/brand1.png",
    },
    {
      id: 2,
      ImageURL: "/images/brand2.png",
    },
    {
      id: 3,
      ImageURL: "/images/brand3.png",
    },
    {
      id: 4,
      ImageURL: "/images/brand4.png",
    },
    {
      id: 5,
      ImageURL: "/images/brand5.png",
    },
    {
      id: 6,
      ImageURL: "/images/brand6.png",
    },
  ];
  return (
    <div className="Brands container">
      <div>
        <h1 className="underline decoration-red-500 text-center text-3xl font-bold mt-20 mb-5">
          Famous Brand
        </h1>
        <div>
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full max-w-330 mx-auto"
          >
            <CarouselContent>
              {Brands.map((item) => (
                <CarouselItem key={item.id} className="basis-1/4 ">
                  <div>
                    <Image
                      src={item.ImageURL}
                      width={500}
                      height={500}
                      alt="image brand"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="previousBrands" />
            <CarouselNext className="nextBrands" />
          </Carousel>
        </div>
      </div>
      <div className="BrandImg mt-32 flex items-center gap-5 flex-row">
        <div className="relative">
          <Image
            src="/images/banner1.jpg"
            width={600}
            height={600}
            alt="Image"
            className="mx-auto"
          />
          <div className="Luxury absolute top-12 p-4 text-white">
            <h1 className="text-5xl font-bold ">
              FRAGRANCE <br /> FOR HER
            </h1>
            <p className="mt-4 mb-5">It's a long <br/> established fact distract</p>
            <div className="BTN bg-[#ec462d] text-center py-2 px-4 w-32 cursor-pointer">
              <Link href="/">Go Home</Link>
            </div>
          </div>
        </div>
        <div className="relative">
          <Image
            src="/images/banner2.jpg"
            width={600}
            height={600}
            alt="Image"
            className="mx-auto"
          />
          <div className=" Luxury absolute p-4 text-white top-12">
            <h1 className="text-5xl font-bold ">
              LUXURY WITH <br /> PERFUME
            </h1>
            <p className="mt-4 mb-5">It's a long established fact distract</p>
             <div className="BTN bg-[#ec462d] text-center py-2 px-4 w-32 cursor-pointer">
              <Link href="/">Go Home</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Brands;
