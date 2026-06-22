"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestPage() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [detail, setDetail] = useState<string>("");

  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase
        .from("demo_requests")
        .select("*");

      console.log("DATA:", data);
      console.log("ERROR:", error);

      if (error) {
        setStatus("error");
        setDetail(error.message);
      } else {
        setStatus("ok");
        setDetail(`Connected. Rows found: ${data?.length ?? 0}`);
      }
    }
    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F7F5] flex items-center justify-center p-10">
      <div className="bg-white rounded-2xl border border-[#E4E0D9] shadow-sm p-10 max-w-md w-full text-center space-y-4">
        <div
          className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center text-2xl ${
            status === "loading"
              ? "bg-gray-100"
              : status === "ok"
              ? "bg-emerald-50"
              : "bg-red-50"
          }`}
        >
          {status === "loading" ? "⏳" : status === "ok" ? "✅" : "❌"}
        </div>
        <h1 className="text-lg font-black text-[#0D2B1A]">
          {status === "loading"
            ? "Testing Supabase Connection..."
            : status === "ok"
            ? "Supabase Connected"
            : "Connection Failed"}
        </h1>
        <p className="text-sm text-[#5C7A68] font-mono break-all">{detail}</p>
        {status !== "loading" && (
          <p className="text-xs text-[#9CA3AF]">
            Check browser console for full DATA / ERROR logs.
          </p>
        )}
      </div>
    </div>
  );
}
