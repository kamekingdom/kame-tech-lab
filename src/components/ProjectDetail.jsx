import { useEffect, useState } from "react";
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

/**
 * ProjectDetail コンポーネント
 * ------------------------------------------------------------
 * Firestore に格納されたプロジェクトドキュメントを取得し，
 * そのメタデータを Tiny-Slider で閲覧可能な形に整形して描画する．
 * 主要な変更点：
 *   1.  動画（videos または movie フィールド）が存在する場合には
 *       main_image よりも高い優先度でスライドの先頭に配置する．
 *   2.  スライド生成ロジックを関数 buildSliderContent に集約．
 *   3.  スライド要素生成を appendVideo / appendImage のヘルパで抽象化．
 * ------------------------------------------------------------
 */
const ProjectDetail = () => {
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // URL からクエリパラメータ id を抽出
  const projectId = new URLSearchParams(location.search).get("id");

  /* ------------------------------------------------------------------
   *  Firestore からドキュメントを非同期に取得
   * ---------------------------------------------------------------- */
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const snap = await getDoc(doc(db, "projects", projectId));
        if (snap.exists()) {
          setProjectData(snap.data());
        } else {
          console.error("Project not found:", projectId);
        }
      } catch (err) {
        console.error("Error fetching project data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjectData();
  }, [projectId]);

  /* ------------------------------------------------------------------
   *  プロジェクトメタデータが取得できたらスライダーを構築
   * ---------------------------------------------------------------- */
  useEffect(() => {
    if (!projectData) return;

    buildSliderContent(projectData);

    const slider = tns({
      container: ".my-slider",
      items: 1,
      slideBy: "page",
      autoplay: true,
      autoplayTimeout: 5000,
      autoplayButtonOutput: false,
      controls: true,
      nav: false,
      loop: true,
      prevButton: ".tns-prev",
      nextButton: ".tns-next",
      onInit: updatePageNumber,
    });

    slider.events.on("indexChanged", updatePageNumber);
  }, [projectData]);

  /* ------------------------------------------------------------------
   *  Tiny-Slider 用の DOM 要素を動的生成
   *   優先順位： videos 配列 > movie 単一 URL > main_image
   * ---------------------------------------------------------------- */
  const buildSliderContent = (data) => {
    const container = document.querySelector(".my-slider");
    if (!container) return;

    const slides = [];

    /**
     * 動画埋め込み：ブラウザ UI とダウンロード操作を極力抑制
     *   - controls   : 付けない → 既定 UI を非表示
     *   - controlsList: nodownload noremoteplayback nofullscreen
     *   - disablePictureInPicture / disableRemotePlayback
     *   - oncontextmenu="return false;" で右クリック保存を抑制
     *   - pointer-events:none でクリック／タップ無効化 (ただし再生は自動)
     */
    const appendVideo = (src) => {
      slides.push(`
        <div>
          <video
            src="${src}"
            autoplay
            loop
            playsinline
            disablePictureInPicture
            disableRemotePlayback
            controlsList="nodownload noremoteplayback nofullscreen"
            oncontextmenu="return false;"
            class="media-fluid"
            style="width: 100%; max-height: 500px; object-fit: contain; pointer-events: none;"
          ></video>
        </div>`);
    };

    const appendImage = (src, alt = "Slide Image") => {
      slides.push(`
        <div>
          <img src="${src}" alt="${alt}" class="media-fluid"
               style="width: 100%; max-height: 500px; object-fit: contain;" />
        </div>`);
    };

    // 1. 動画があれば最優先で追加
    if (Array.isArray(data.videos) && data.videos.length) {
      data.videos.forEach(appendVideo);
    } else if (data.movie) {
      appendVideo(data.movie);
    } else if (data.main_image) {
      // 動画がない場合のみメイン画像を先頭へ
      appendImage(data.main_image, "Main Image");
    }

    // 2. 追加画像を後続スライドとして追加
    if (Array.isArray(data.images) && data.images.length) {
      data.images.forEach((imgSrc) => appendImage(imgSrc));
    }

    container.innerHTML = slides.join("\n");
  };

  /* ------------------------------------------------------------------
   *  スライダーのページ番号を更新
   * ---------------------------------------------------------------- */
  const updatePageNumber = (info) => {
    const currentIndex = info.displayIndex || info.index + 1;
    const pageNumber = document.getElementById("page-number");
    if (pageNumber)
      pageNumber.textContent = `${currentIndex} / ${info.slideCount}`;
  };

  /* ------------------------------------------------------------------
   *  レンダリング
   * ---------------------------------------------------------------- */
  if (loading) {
    return <Loader color="#808080" size="3rem" />;
  }

  if (!projectData) {
    return (
      <div className="text-center mt-5">
        <h2>Project not found</h2>
        <p>The project you are looking for does not exist.</p>
      </div>
    );
  }

  // タイプ（口頭発表など）のバッジ色を決定
  const getTypeColor = (type) => {
    switch (type) {
      case "口頭発表":
        return "#336699";
      case "デモポスター":
        return "#e97132";
      case "フルペーパー":
        return "#cc0000";
      case "一般":
        return "#009933";
      default:
        return "#52565e";
    }
  };

  return (
    <>
      <Header />

      <div className="section bg-white py-4">
        <div className="container">
          {/* タイトルとサブタイトル */}
          <div className="row mb-3">
            <div className="col-12">
              <h2
                className="text-start"
                style={{ fontFamily: "'Roboto', sans-serif" }}
              >
                {projectData.title}
              </h2>
              <span
                className="subheading d-inline-block mb-2 text-start"
                style={{ fontFamily: "'Roboto', sans-serif", fontSize: "15px" }}
              >
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
            <p>
              {projectData.date || ""}
              {"\u3000"}
              {projectData.type?.map((t, idx) => (
                <span
                  key={idx}
                  className="badge me-1"
                  style={{ backgroundColor: getTypeColor(t), color: "white" }}
                >
                  {t}
                </span>
              ))}
            </p>
          </div>
          <div className="unit-4 d-flex flex-column">
            <p>{projectData.description || ""}</p>
          </div>

          <hr />

          <div className="unit-4 d-flex flex-column">
            {projectData.journal && (
              <p className="d-flex flex-wrap gap-2">
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
                      color: "#6c757d",
                      borderColor: "#6c757d",
                    }}
                  >
                    <FaFileAlt
                      style={{ marginRight: "5px", color: "#6c757d" }}
                    />{" "}
                    Paper
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
                      color: "#6c757d",
                      borderColor: "#6c757d",
                    }}
                  >
                    <FaTrophy
                      style={{
                        marginRight: "5px",
                        color: "#6c757d",
                        fontSize: "16px",
                      }}
                    />
                    <span style={{ color: "#6c757d", fontSize: "14px" }}>
                      {projectData.award}
                    </span>
                  </a>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ProjectDetail;
