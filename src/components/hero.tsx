import Image from "next/image"

const Hero = () => {

    return(
        <div>
            <section className="relative h-[400px]">
              <div className="absolute inset-0 bg-gray-900 opacity-50 z-10"></div>
              <Image src="/banner-image.jpg" alt="Banner" layout="fill" objectFit="cover" />
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center text-white">
                <h2 className="text-4xl font-bold">Equal Opportunity for Women in Business</h2>
                <p className="mt-4">Unlock Opportunities: Buy, Sell, and Thrive with UNWOMEN Market Square</p>
                <button className="mt-6 bg-yellow-500 text-white px-4 py-2 rounded-lg">Shop Now</button>
              </div>
            </section>
        </div>
    )
}

export default Hero