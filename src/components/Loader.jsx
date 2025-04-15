import React from "react";

const Loader = ({ color = "#808080", size = "3rem" }) => {
    return (
        <div className="text-center py-5">
            <div
                className="spinner-border"
                role="status"
                style={{
                    color: color, // ローダーの色を設定
                    width: size, // サイズ（幅）
                    height: size, // サイズ（高さ）
                }}
            >
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
};

export default Loader;
