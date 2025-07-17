import { useEffect, useState } from "react";
import { useCallback } from "react";
import { db } from "../firebase"; // Firestoreのインポート
import { collection, getDocs } from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { BiMapPin } from "react-icons/bi"; // Bootstrapの地図ピンアイコンをインポート
import { BiSearch } from "react-icons/bi"; // 虫眼鏡アイコンのインポート
import Header from "./Header";
import Footer from "./Footer";
import "../style.css";
import Loader from "./Loader";
import { useTranslation } from "react-i18next"; // i18n用フックのインポート
import { FaLinkedin, FaGithub, FaEnvelope } from "react-icons/fa";


const MainPage = () => {
    const [projects, setProjects] = useState([]); // プロジェクトデータを格納するステート
    const [sortCriterion, setSortCriterion] = useState("all");
    const [searchKeyword, setSearchKeyword] = useState(""); // 検索キーワードのステート
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();
    const { t } = useTranslation(); // 翻訳関数の取得

    // ソート関数（常に新しい順）
    const sortProjects = useCallback((projects) => {
        return projects
            .map((project) => ({
                ...project,
                date: validateAndFormatDate(project.date),
            }))
            .filter((project) => project.date !== null)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, []);

    // 日付フォーマットのチェックと修正
    const validateAndFormatDate = (dateString) => {
        // 日付フォーマットにマッチするか確認（例: YYYY-MM-DD）
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(dateString)) {
            console.warn(`Invalid date format: ${dateString}`);
            return null;
        }

        // 日付が有効か確認
        const [year, month, day] = dateString.split("-").map(Number);
        const isValidDate = (date) => !isNaN(date) && date instanceof Date;
        const parsedDate = new Date(year, month - 1, day);

        if (!isValidDate(parsedDate) || parsedDate.getDate() !== day) {
            console.warn(`Invalid date value: ${dateString}`);
            return null;
        }

        return parsedDate.toISOString().split("T")[0]; // フォーマット修正 (ISO 8601形式)
    };

    // useEffect内の変更
    useEffect(() => {
        const fetchProjects = async () => {
            setIsLoading(true);
            try {
                const querySnapshot = await getDocs(collection(db, "projects"));
                const projectList = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                const sortedList = sortProjects(projectList);
                setProjects(sortedList);
            } catch (error) {
                console.error("Error fetching projects:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProjects();
    }, [sortProjects]);

    // Refresh AOS animations when projects are loaded
    useEffect(() => {
        if (!isLoading && window.AOS) {
            window.AOS.refresh();
        }
    }, [isLoading]);

    // ソートされたプロジェクト
    const sortedProjects = sortProjects(projects, sortCriterion);

    // フィルタリングされたプロジェクト
    const filteredProjects = sortedProjects.filter((project) => {
        const matchesSearch = project.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            (project.subtitle && project.subtitle.toLowerCase().includes(searchKeyword.toLowerCase())) ||
            (project.location && project.location.toLowerCase().includes(searchKeyword.toLowerCase()));

        if (sortCriterion === "academic") {
            return matchesSearch && project.category?.toLowerCase().includes("academic");
        } else if (sortCriterion === "product") {
            return matchesSearch && project.category?.toLowerCase().includes("product");
        }

        return matchesSearch; // "all"の場合
    });


    // タグの背景色を決定する関数
    const getTypeColor = (type) => {
        switch (type) {
            case "口頭発表":
            case "Presentation":
                return "#336699"; // 青
            case "デモポスター":
            case "Demo Poster":
                return "#e97132"; // オレンジ
            case "フルペーパー":
            case "Full Paper":
                return "#cc0000"; // 赤
            case "一般":
            case "General":
                return "#009933"; // 緑
            case "学内発表":
            case "Internal Presentation":
            default:
                return "#52565e"; // グレー
        }
    };


    // タグの翻訳を取得する関数
    const translateTag = (type, t) => {
        switch (type) {
            case "口頭発表":
                return t("tag_oral"); // "口頭発表" -> 翻訳キー
            case "デモポスター":
                return t("tag_demo"); // "デモポスター" -> 翻訳キー
            case "フルペーパー":
                return t("tag_full"); // "フルペーパー" -> 翻訳キー
            case "一般":
                return t("tag_general"); // "一般" -> 翻訳キー
            case "学内発表":
                return t("tag_internal"); // "学内発表" -> 翻訳キー
            default:
                return type; // 未知のタグはそのまま表示
        }
    };


    return (
        <div>
            {/* ヘッダー */}
            <Header></Header>

            <section id="section-aboutme" className="py-5 bg-white" style={{ backgroundColor: "#f8f9fa" }} data-aos="fade-up">
                <div className="container">
                    <div className="row mb-3">
                        <div className="text-center mb-3">
                            <span className="text-secondary" style={{ fontSize: "0.9rem", fontWeight: "bold" }}>MY PORTFOLIO</span>
                            <h2 className="my-1" style={{ fontWeight: "bold", fontSize: "2rem" }}>PROFILE</h2>
                            <hr className="mx-auto" />
                        </div>
                    </div>
                    <div className="row d-flex justify-content-center align-items-start">
                        {/* 左側 - 写真 */}
                        <div className="col-md-4 col-lg-3 mb-4 text-center">
                            <img
                                src="images/kame.jpg"
                                alt="中村裕大の写真"
                                className="img-fluid"
                                style={{
                                    borderRadius: "50%",
                                    maxWidth: "140px",
                                    border: "1px solid #808080",
                                }}
                            />
                            <p style={{ fontSize: "1.5rem", fontWeight: "bold", marginTop: "15px", color: "black" }}>{t("profile_name")}</p>
                            {t("profile_affiliation")}
                            <p style={{ fontSize: "1rem", fontWeight: "normal", color: "#606060" }}>{t("profile_position")}</p>
                        </div>

                        {/* 右側 - About Me詳細 */}
                        <div className="col-md-8">
                            <h3 style={{ fontWeight: "bold", fontSize: "1.5rem", marginBottom: "15px" }}>About Me</h3>
                            <p style={{ color: "#606060", lineHeight: "1.8", marginBottom: "30px" }}>
                                {t("profile_description")}
                            </p>
                            <div className="row mt-4 d-flex align-items-stretch">
                                <div className="col-md-4 h-100 mb-4 mb-md-0">
                                    <h4 style={{ fontWeight: "bold", fontSize: "1.25rem", marginBottom: "15px" }}>{t("profile_link_title")}</h4>
                                    <ul style={{ color: "#606060", listStyleType: "none", paddingLeft: "0", marginBottom: "0" }}>
                                        <li>
                                            <a href="mailto:yudainakamura@keio.jp" style={{ color: "#D44638", textDecoration: "none", display: "flex", alignItems: "center" }}>
                                                <FaEnvelope style={{ marginRight: "8px" }} /> Email
                                            </a>
                                        </li>
                                        <li>
                                            <a href="https://github.com/kamekingdom" target="_blank" rel="noopener noreferrer" style={{ color: "#333", textDecoration: "none", display: "flex", alignItems: "center" }}>
                                                <FaGithub style={{ marginRight: "8px" }} /> GitHub
                                            </a>
                                        </li>
                                        <li>
                                            <a href="https://www.linkedin.com/in/yudai-nakamura-kamekingdom/" target="_blank" rel="noopener noreferrer" style={{ color: "#0a66c2", textDecoration: "none", display: "flex", alignItems: "center" }}>
                                                <FaLinkedin style={{ marginRight: "8px" }} /> LinkedIn
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                                <div className="col-md-6">
                                    <h4 style={{ fontWeight: "bold", fontSize: "1.25rem", marginBottom: "15px" }}>{t("education_title")}</h4>
                                    <ul style={{ color: "#606060", listStyleType: "none", paddingLeft: "0", marginBottom: "0" }}>
                                        <li># Human Computer Interaction</li>
                                        <li># Multimodal AI</li>
                                        <li># Deep Learning</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section >

            {/* <TechStackSection /> */}

            {/* 活動セクション */}
            <section id="section-works" className="py-5 bg-light" data-aos="fade-up">
                <div className="container">
                    {isLoading ? (
                        <Loader color="#808080" size="3rem" /> // ローダーを適用
                    ) : (
                        <>
                            <div className="text-center mb-4">
                                <span className="text-secondary">MY REPOSITORY</span>
                                <h2 className="my-1">ACTIVITY</h2>
                                <hr className="mx-auto" />
                            </div>
                            <div className="d-flex justify-content-center align-items-center mb-4">
                                {/* 検索ボックスとソートを一体化 */}
                                <div
                                    className="input-group"
                                    style={{
                                        maxWidth: "600px",
                                        flexGrow: 1,
                                    }}
                                >
                                    {/* 虫眼鏡アイコン */}
                                    <span
                                        className="input-group-text"
                                        style={{
                                            borderRadius: "8px 0 0 8px",
                                            backgroundColor: "#f8f9fa",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <BiSearch size={20} color="#6c757d" />
                                    </span>

                                    {/* 検索ボックス */}
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search..."
                                        value={searchKeyword}
                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                        style={{
                                            borderRadius: "0",
                                        }}
                                    />

                                    {/* ソートドロップダウン */}
                                    <select
                                        className="form-select"
                                        value={sortCriterion}
                                        onChange={(e) => setSortCriterion(e.target.value)} // 値を更新
                                        style={{
                                            borderRadius: "0 8px 8px 0",
                                            maxWidth: "150px",
                                        }}
                                    >
                                        <option value="all">ALL</option>
                                        <option value="academic">ACADEMIC</option>
                                        <option value="product">PRODUCT</option>
                                    </select>
                                </div>
                            </div>

                            <div className="row g-4">
                                {filteredProjects.length > 0 ? (
                                    filteredProjects.map((project) => (
                                        <div className="col-lg-4 col-md-6 col-sm-12 d-flex" key={project.id} data-aos="fade-up">
                                            <div
                                                className="card shadow-sm flex-fill"
                                                onClick={() => navigate(`./project-detail?id=${project.id}`)} // カード全体をクリック可能に
                                                style={{
                                                    cursor: "pointer", // クリックできることを示す
                                                }}
                                            >
                                                <img
                                                    src={project.main_image}
                                                    className="card-img-top"
                                                    alt={project.title}
                                                    style={{
                                                        width: "100%",
                                                        height: "auto",
                                                        objectFit: "contain",
                                                        backgroundColor: "#f8f9fa",
                                                    }}
                                                />
                                                <div className="card-body">
                                                    {/* 日付とタイプ */}
                                                    <div className="d-flex align-items-center mb-2">
                                                        <small className="text-muted me-2">{project.date}</small>
                                                        <div>
                                                            {Array.isArray(project.type)
                                                                ? project.type.map((tag, index) => (
                                                                    <span
                                                                        key={index}
                                                                        className="badge me-1"
                                                                        style={{
                                                                            backgroundColor: getTypeColor(tag.trim()), // タグに対応する背景色を取得
                                                                            color: "white",
                                                                        }}
                                                                    >
                                                                        {translateTag(tag.trim(), t)} {/* タグを翻訳 */}
                                                                    </span>
                                                                ))
                                                                : typeof project.type === "string"
                                                                    ? project.type.split(",").map((tag, index) => (
                                                                        <span
                                                                            key={index}
                                                                            className="badge me-1"
                                                                            style={{
                                                                                backgroundColor: getTypeColor(tag.trim()), // タグに対応する背景色を取得
                                                                                color: "white",
                                                                            }}
                                                                        >
                                                                            {translateTag(tag.trim(), t)} {/* タグを翻訳 */}
                                                                        </span>
                                                                    ))
                                                                    : null}
                                                        </div>
                                                    </div>


                                                    {/* タイトルとサブタイトル */}
                                                    <h5 className="card-title">{project.title}</h5>
                                                    <p className="card-text text-muted">{project.subtitle}</p>

                                                    {/* ロケーションとアイコン */}
                                                    <div className="d-flex align-items-center" style={{ marginBottom: "-16px" }}>
                                                        <BiMapPin className="text-secondary me-2" size={20} />
                                                        <small className="text-secondary">{project.location}</small>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center">プロジェクトデータがありません</p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </section >
            {/* フッター */}
            < Footer ></Footer >
        </div >
    );
};

export default MainPage;