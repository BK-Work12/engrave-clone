import CreatorTools from "../components/CreatorTools";
import Footer from "../components/Footer";
import NavBar from "../components/NavBar";
import { router } from "@inertiajs/react";

export default function Create() {
    return (
        <>
            <div className="mt-15 mx-auto text-center max-w-[780px] relative px-4">
                <div className="blur-[279.3px] bg-[#6235FD] absolute left-1/2 -translate-x-1/2 w-[366px] h-[368px]"></div>
                <h3 className="main-head relative">Creator Tools</h3>
                <p className="main-p mt-7 relative">Automatically generate intricate, beautiful fill patterns for any shape. Perfect for laser engraving, leather tooling, and digital art.</p>
            </div>
            <div className="mt-35 flex flex-col gap-11 mx-auto justify-center items-center relative px-4">
                <CreatorTools
                    onClick={() => router.visit("/ai-design-generator")}
                    btnText="Launch Generator"
                    image='/assets/AIDesign.png'
                    head="AI Design Generator"
                    para="Upload an outline and let our AI fill it with intricate scrollwork and other decorative styles. Perfect for irregular shapes and custom pieces."
                />
                <CreatorTools
                    onClick={() => router.visit("/seamless-patterns")}
                    btnText="Explore patterns"
                    image='/assets/SeamlessPattern.png'
                    head="Seamless Pattern Creator"
                    para="Upload your outline or silhouette and instantly fill it with stunning patterns. Choose from our pattern library or upload your own design for a unique fill."
                />
                <CreatorTools
                    onClick={() => router.visit("/svg-tracing")}
                    btnText="Launch Tracer"
                    image='/assets/SVGTracer.png'
                    head="SVG Tracing Tool"
                    para="Convert your JPG/PNG images to SVG vector graphics. Adjustable settings for optimal output and best preparation for your laser engraver"
                />
            </div>
        </>
    )
}
