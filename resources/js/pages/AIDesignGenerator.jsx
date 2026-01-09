import { useState } from "react";

import DesignGeneratorHeader from "../components/DesignGeneratorHeader";
import Result from "../components/Result";
import Upload from "../components/Upload";
import Generate from "../components/Generate";
import SeamlessPatternStyling from "../components/SeamlessPatternStyling";
import { usePatternEngraver } from "../hooks/usePatternEngraver";

export default function AIDesignGenerator() {
    const patternEngraver = usePatternEngraver();

    return (
        <>
            <DesignGeneratorHeader title="AI Design Generator" />
            <div className="container flex flex-col lg:flex-row justify-center items-stretch mx-auto mt-12 mb-15">
                <div className="flex flex-col justify-center px-4 items-stretch w-full lg:flex-row gap-8">
                    {/* Left: Controls */}
                    <div className="w-full lg:w-1/3">
                        <Generate className="w-full" onGenerate={() => console.log("Generate clicked")} />
                    </div>

                    {/* Center: Result */}
                    <Result
                        className="w-full lg:w-1/3"
                        patternEngraver={patternEngraver}
                    />

                    {/* Right: Upload */}
                    <div className="flex flex-col mx-auto justify-start gap-7 w-full lg:w-1/3">
                        <Upload onUpload={patternEngraver.handleUpload} className="w-full" />
                        {/* If we want manual download button outside result: */}
                        {/* <Download /> */}
                    </div>
                </div>
            </div>
        </>
    )
}