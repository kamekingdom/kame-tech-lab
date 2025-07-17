import { Carousel } from "react-bootstrap";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi"; // ⬅ 追加
import {
    SiPython,
    SiCplusplus,
    SiReact,
    SiDocker,
    SiGooglecloud,
    SiOpenai,
    SiUnity,
    SiProcessingfoundation,
} from "react-icons/si";
import { useTranslation } from "react-i18next";

const techData = [
    {
        titleKey: "tech_category_language",
        icon: <SiPython size={24} />,
        items: ["Python", "C", "C++", "Java", "Dart", "R"],
    },
    {
        titleKey: "tech_category_web",
        icon: <SiReact size={24} />,
        items: ["React", "PHP", "HTML", "CSS", "JS"],
    },
    {
        titleKey: "tech_category_cloud",
        icon: <SiGooglecloud size={24} />,
        items: ["Google Cloud", "Docker"],
    },
    {
        titleKey: "tech_category_ml",
        icon: <SiOpenai size={24} />,
        items: ["OpenAI API", "Azure Cognitive Services"],
    },
    {
        titleKey: "tech_category_media",
        icon: <SiProcessingfoundation size={24} />,
        items: ["Processing", "Max 8"],
    },
    {
        titleKey: "tech_category_game",
        icon: <SiUnity size={24} />,
        items: ["Unity", "C#"],
    },
];

const TechStackSection = () => {
    const { t } = useTranslation();

    return (
        <section id="section-techstack" className="py-5 bg-white">
            <div className="container">
                <div className="text-center mb-4">
                    <span className="text-secondary">TECHNOLOGY</span>
                    <h2 className="my-1">TECH STACK</h2>
                    <hr className="mx-auto" />
                </div>

                {/* ===== Carousel ===== */}
                <Carousel
                    interval={5000}
                    controls={true}
                    indicators={true}
                    fade={false}
                    pause="hover"
                    nextIcon={<BiChevronRight size={40} color="#bec3c8" />}
                    prevIcon={<BiChevronLeft size={40} color="#bec3c8" />}
                >
                    {techData.map(({ titleKey, icon, items }) => (
                        <Carousel.Item key={titleKey} className="p-4">
                            <div className="d-flex flex-column align-items-center">
                                <h4 style={{ fontWeight: "bold", fontSize: "1.25rem", marginBottom: "15px" }}>
                                    {icon}&nbsp;&nbsp;{t(titleKey)}
                                </h4>

                                <ul
                                    className="list-unstyled d-flex flex-wrap justify-content-center"
                                    style={{ columnGap: "1.5rem", rowGap: ".75rem" }}
                                >
                                    {items.map((tech) => (
                                        <li key={tech} style={{ fontWeight: 500 }}>
                                            {tech}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Carousel.Item>
                    ))}
                </Carousel>
            </div>
        </section>
    );
};

export default TechStackSection;
