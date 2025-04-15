import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; // Firebase設定
import "bootstrap/dist/css/bootstrap.min.css";
import { tns } from "tiny-slider/src/tiny-slider";
import "tiny-slider/dist/tiny-slider.css";
import Header from "./Header";
import Footer from "./Footer";
import "../style.css";
import { FaFileAlt, FaTrophy } from "react-icons/fa";
import Loader from "./Loader";

const ProjectDetail = () => {
    const [projectData, setProjectData] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    // URLからプロジェクトIDを取得
    const projectId = new URLSearchParams(location.search).get("id");

    useEffect(() => {
        const fetchProjectData = async () => {
            try {
                const docRef = doc(db, "projects", projectId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setProjectData(docSnap.data());
                } else {
                    console.error("Project not found:", projectId);
                }
            } catch (error) {
                console.error("Error fetching project data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjectData();
    }, [projectId]);

    useEffect(() => {
        if (projectData) {
            const sliderItems = buildSliderContent(projectData);

            // Tiny Sliderのインスタンスを初期化
            const slider = tns({
                container: ".my-slider",
                items: 1,
                slideBy: "page",
                autoplay: false,
                controls: true,
                nav: false,
                loop: true,
                prevButton: ".tns-prev",
                nextButton: ".tns-next",
                onInit: (info) => updatePageNumber(info),
            });

            // ページ番号の更新
            slider.events.on("indexChanged", (info) => updatePageNumber(info));
        }
    }, [projectData]);

    // スライダーのコンテンツを構築
    const buildSliderContent = (projectData) => {
        const sliderContainer = document.querySelector(".my-slider");
        if (!sliderContainer) return;

        const sliderContent = [];

        // 1ページ目: main_image
        if (projectData.main_image) {
            sliderContent.push(`
                <div>
                    <img src="${projectData.main_image}" alt="Main Image" class="media-fluid" 
                        style="width: 100%; max-height: 500px; object-fit: contain;" />
                </div>
            `);
        }

        // 2ページ目以降: images または videos
        // if (projectData.videos?.length) {
        //     projectData.videos.forEach((video) => {
        //         sliderContent.push(`
        //             <div>
        //                 <video src="${video}" controls class="media-fluid" 
        //                     style="width: 100%; max-height: 500px; object-fit: contain;">
        //                 </video>
        //             </div>
        //         `);
        //     });
        // } else 
        if (projectData.images?.length) {
            projectData.images.forEach((image) => {
                sliderContent.push(`
                    <div>
                        <img src="${image}" alt="Slide Image" class="media-fluid" 
                            style="width: 100%; max-height: 500px; object-fit: contain;" />
                    </div>
                `);
            });
        }

        sliderContainer.innerHTML = sliderContent.join("");
    };

    // ページ番号の更新
    const updatePageNumber = (info) => {
        const currentIndex = info.displayIndex || info.index + 1; // 現在のスライド番号
        const totalSlides = info.slideCount; // 総スライド数
        const pageNumber = document.getElementById("page-number");
        if (pageNumber) {
            pageNumber.textContent = `${currentIndex} / ${totalSlides}`;
        }
    };

    if (loading) {
        return <Loader color="#808080" size="3rem" />; // カスタム色とサイズで表示
    }


    if (!projectData) {
        return (
            <div className="text-center mt-5">
                <h2>Project not found</h2>
                <p>The project you are looking for does not exist.</p>
            </div>
        );
    }

    const getTypeColor = (type) => {
        switch (type) {
            case "口頭発表":
                return "#336699"; // 青
            case "デモポスター":
                return "#e97132"; // オレンジ
            case "フルペーパー":
                return "#cc0000"; // 赤
            case "一般":
                return "#009933"; // 緑
            default:
                return "#52565e"; // グレー
        }
    };

    return (
        <>
            {/* ヘッダー */}
            <Header />

            <div className="section bg-white py-4">
                <div className="container">
                    {/* タイトルとサブタイトル */}
                    <div className="row mb-3">
                        <div className="col-12">
                            <h2 className="text-start" style={{ fontFamily: "'Roboto', sans-serif" }}>{projectData.title}</h2>
                            <span className="subheading d-inline-block mb-2 text-start" style={{ fontFamily: "'Roboto', sans-serif", fontSize: "15px" }}>
                                {projectData.subtitle || ""}
                            </span>
                            <hr />
                        </div>
                    </div>

                    {/* スライダー */}
                    <div className="row justify-content-center align-items-center mb-4">
                        <div className="my-slider-container">
                            <div className="my-slider"></div>
                            <div className="slider-controls text-center mt-2">
                                <button
                                    className="tns-prev btn btn-light border me-2"
                                    style={{ fontSize: "14px", padding: "5px 10px" }}
                                >
                                    Prev
                                </button>
                                <span id="page-number" className="text-muted"></span>
                                <button
                                    className="tns-next btn btn-light border ms-2"
                                    style={{ fontSize: "14px", padding: "5px 10px" }}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>

                    <hr className="mx-auto" />

                    {/* 詳細情報 */}
                    <div className="unit-4 d-flex flex-column mt-4">
                        <p>{projectData.date || ""}{"　"}
                            {projectData.type?.map((type, index) => (
                                <span
                                    key={index}
                                    className="badge me-1"
                                    style={{
                                        backgroundColor: getTypeColor(type),
                                        color: "white",
                                    }}
                                >
                                    {type}
                                </span>

                            ))}
                        </p>
                        {/* <p><strong>Location:</strong> {projectData.location || ""}</p> */}
                        {/* <p>{projectData.authors?.join(", ") || ""}</p> */}
                    </div>
                    <div className="unit-4 d-flex flex-column">
                        <p>{projectData.description || ""}</p>
                    </div>

                    <hr />

                    <div className="unit-4 d-flex flex-column">
                        {projectData.journal && (
                            <>
                                {/* <p>
                                    <strong>Journal:</strong> {projectData.journal.name || ""}
                                </p>
                                <p>
                                    <strong>Volume:</strong> {projectData.journal.volume || ""} &emsp;
                                    <strong>Number:</strong> {projectData.journal.number || ""} &emsp;
                                    <strong>Pages:</strong> {projectData.journal.pages || ""}
                                </p> */}
                                <p className="d-flex flex-wrap gap-2"> {/* Flexレイアウトと隙間を調整 */}
                                    {projectData.sourceUrl && (
                                        <a
                                            href={projectData.sourceUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-outline-secondary d-inline-flex align-items-center"
                                            style={{
                                                textDecoration: "none",
                                                padding: "5px 15px",
                                                fontSize: "14px",
                                                borderRadius: "20px",
                                                color: "#6c757d", // 灰色のテキスト色
                                                borderColor: "#6c757d", // 灰色のボーダー
                                            }}
                                        >
                                            <FaFileAlt style={{ marginRight: "5px", color: "#6c757d" }} /> Paper
                                        </a>
                                    )}
                                    {projectData.award && (
                                        <a
                                            href={projectData.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-outline-secondary d-inline-flex align-items-center"
                                            style={{
                                                textDecoration: "none",
                                                padding: "5px 15px",
                                                fontSize: "14px",
                                                borderRadius: "20px",
                                                color: "#6c757d", // 灰色のテキスト色
                                                borderColor: "#6c757d", // 灰色のボーダー
                                            }}
                                        >
                                            <FaTrophy style={{ marginRight: "5px", color: "#6c757d", fontSize: "16px" }} /> {/* トロフィーアイコン */}
                                            <span style={{ color: "#6c757d", fontSize: "14px" }}>{projectData.award}</span>
                                        </a>
                                    )}

                                </p>
                            </>
                        )}
                    </div>


                </div>
            </div>

            {/* フッター */}
            <Footer></Footer>
        </>
    );
};

export default ProjectDetail;
