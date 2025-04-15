import React from "react";
import { useTranslation } from "react-i18next"; // i18n用フック
import Dropdown from "react-bootstrap/Dropdown";
import { FaGlobe, FaFlagUsa, FaFlag } from "react-icons/fa"; // React Iconsからのアイコンインポート

const Header = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng); // 言語を変更
    };

    return (
        <header
            className="navbar navbar-expand-lg navbar-dark fs-2"
            style={{
                background: "#333937",
                fontFamily: "'Playfair Display', serif",
                fontWeight: "700", // 太字
                paddingTop: "15px", // 上部のスペース
                paddingBottom: "15px", // 下部のスペース
            }}
        >
            <div className="container d-flex justify-content-between align-items-center">
                {/* 左側 - ブランドロゴ */}
                <a className="navbar-brand fs-2" href="./">
                    Nakamura Yudai
                </a>

                {/* 右側 - 言語選択 */}
                <Dropdown>
                    <Dropdown.Toggle
                        id="dropdown-basic"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px", // アイコンとテキストの間隔
                            fontSize: "1rem",
                            fontWeight: "bold",
                            padding: "5px 15px",
                            borderRadius: "5px",
                            backgroundColor: "#333937", // ヘッダーと一致する背景色
                            color: "white", // テキスト色を白に
                            border: "none", // ボーダーを削除
                        }}
                    >
                        <FaGlobe size={20} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => changeLanguage("ja")} style={{
                            fontSize: "15px",
                            fontFamily: '"Helvetica Neue"',
                            fontWeight: "400"
                        }}>
                            日本語
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => changeLanguage("en")}
                            style={{
                                fontFamily: '"Segoe UI", Roboto,',
                                fontWeight: "400"
                            }}
                        >
                            English
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        </header >
    );
};

export default Header;
