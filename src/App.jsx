// App component goes here
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Megaphone, Pencil, TableProperties, LogOut, ShieldCheck, Eye, EyeOff } from "lucide-react";

export default function App() {
  const notifSound = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [asn, setAsn] = useState({
    nama: "",
    nomorPegawai: "",
    tmtPns: "",
    riwayatTmtKgb: "",
    riwayatTmtPangkat: "",
    jadwalKgbBerikutnya: "",
    jadwalKenaikanPangkatBerikutnya: ""
  });
  const [data, setData] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [notifList, setNotifList] = useState([]);
  const [notifPangkatList, setNotifPangkatList] = useState([]);

  const tabelTriggerRef = useRef(null);

  useEffect(() => {
    if (notifSound.current && (notifList.length > 0 || notifPangkatList.length > 0)) {
      notifSound.current.play().catch(() => {});
    }
    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);

    const upcoming = data.filter((asn) => {
      if (!asn.jadwalKgbBerikutnya) return false;
      const kgbDate = new Date(asn.jadwalKgbBerikutnya);
      return kgbDate <= threeMonthsFromNow && kgbDate >= today;
    });

    if (upcoming.length > 0) {
      alert("Notifikasi: Ada " + upcoming.length + " pegawai yang akan KGB dalam 3 bulan ke depan.");
    }

    const stored = localStorage.getItem("asnData");
    if (stored) {
      const parsed = JSON.parse(stored);
      const updated = parsed.map((item) => {
        if (item.riwayatTmtKgb && !item.jadwalKgbBerikutnya) {
          const date = new Date(item.riwayatTmtKgb);
          if (!isNaN(date)) {
            date.setFullYear(date.getFullYear() + 2);
            item.jadwalKgbBerikutnya = date.toISOString().split("T")[0];
          }
        }
        if (item.riwayatTmtPangkat && !item.jadwalKenaikanPangkatBerikutnya) {
          const date = new Date(item.riwayatTmtPangkat);
          if (!isNaN(date)) {
            date.setFullYear(date.getFullYear() + 4);
            item.jadwalKenaikanPangkatBerikutnya = date.toISOString().split("T")[0];
          }
        }
        return item;
      });

      setData(updated);
      localStorage.setItem("asnData", JSON.stringify(updated));

      const upcoming = updated.filter((asn) => {
        if (!asn.jadwalKgbBerikutnya) return false;
        const kgbDate = new Date(asn.jadwalKgbBerikutnya);
        return kgbDate <= threeMonthsFromNow && kgbDate >= today;
      });

      setNotifList(upcoming);

      const upcomingPangkat = updated.filter((asn) => {
        if (!asn.jadwalKenaikanPangkatBerikutnya) return false;
        const naikDate = new Date(asn.jadwalKenaikanPangkatBerikutnya);
        return naikDate <= threeMonthsFromNow && naikDate >= today;
      });

      setNotifPangkatList(upcomingPangkat);
    }
  }, []);

  const handleLogin = () => {
    if (credentials.username === "admin" && credentials.password === "admin") {
      setIsLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Username atau password salah.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedAsn = { ...asn, [name]: value };

    if (name === "riwayatTmtKgb") {
      const riwayatDate = new Date(value);
      if (!isNaN(riwayatDate)) {
        riwayatDate.setFullYear(riwayatDate.getFullYear() + 2);
        const formatted = riwayatDate.toISOString().split("T")[0];
        updatedAsn.jadwalKgbBerikutnya = formatted;
      }
    }
    if (name === "riwayatTmtPangkat") {
      const pangkatDate = new Date(value);
      if (!isNaN(pangkatDate)) {
        pangkatDate.setFullYear(pangkatDate.getFullYear() + 4);
        const formatted = pangkatDate.toISOString().split("T")[0];
        updatedAsn.jadwalKenaikanPangkatBerikutnya = formatted;
      }
    }

    setAsn(updatedAsn);
  };

  const handleSubmit = () => {
    let newData;
    if (editIndex !== null) {
      newData = [...data];
      newData[editIndex] = asn;
      setEditIndex(null);
    } else {
      newData = [...data, asn];
    }
    setData(newData);
    localStorage.setItem("asnData", JSON.stringify(newData));
    setAsn({
      nama: "",
      nomorPegawai: "",
      tmtPns: "",
      riwayatTmtKgb: "",
      riwayatTmtPangkat: "",
      jadwalKgbBerikutnya: "",
      jadwalKenaikanPangkatBerikutnya: ""
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-white">
        <Card className="w-[340px] shadow-xl border border-blue-200 rounded-2xl bg-gradient-to-br from-white to-blue-50">
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-center animate-pulse">
              <img
                src="/logo.png"
                alt="Logo BNN"
                className="w-24 h-24 object-contain rounded-full border border-blue-300 shadow"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/100x100.png?text=BNN';
                }}
              />
            </div>
            <h1 className="text-xl font-bold text-center">APLIKASI MONITORING PEGAWAI BNN KOTA BANDUNG</h1>
            <h2 className="text-lg font-semibold text-center">Login</h2>
            <Input
              placeholder="Username"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
            />
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <Button className="w-full" onClick={handleLogin}>
              Masuk
            </Button>
            {loginError && (
              <p className="text-red-600 text-sm text-center">{loginError}</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-white to-blue-50">
      <div className="flex flex-col lg:flex-row">
        <Tabs defaultValue="dashboard" className="w-full">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex flex-row lg:flex-col items-center lg:items-start gap-4 p-4 border-b lg:border-b-0 lg:border-r overflow-x-auto lg:overflow-visible">
  <img src="/logo.png" alt="Logo BNN" className="w-24 h-24 object-contain" />
  <TabsList className="flex flex-row lg:flex-col gap-2 w-full">
    <TabsTrigger value="dashboard" className="flex items-center gap-2">
      <ShieldCheck size={16} /> Dashboard
    </TabsTrigger>
    <TabsTrigger value="notifikasi" className="flex items-center gap-2 relative animate-pulse">
      {notifList.length + notifPangkatList.length > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
          {notifList.length + notifPangkatList.length}
        </span>
      )}
      <Megaphone size={16} /> Notifikasi
    </TabsTrigger>
    <TabsTrigger value="input" className="flex items-center gap-2">
      <Pencil size={16} /> Input Data
    </TabsTrigger>
    <TabsTrigger ref={tabelTriggerRef} value="tabel" className="flex items-center gap-2">
      <TableProperties size={16} /> Data ASN
    </TabsTrigger>
  </TabsList>
              <Button variant="outline" className="mt-4 flex items-center gap-2" onClick={() => setIsLoggedIn(false)}>
                <LogOut size={16} /> Logout
              </Button>
            </div>

            <div className="flex-1">
              <TabsContent value="dashboard">
                <Card className="shadow-lg border border-blue-200 p-6 mb-6 bg-white">
                  <h2 className="text-xl font-bold mb-2">Selamat datang di Dashboard</h2>
                  <p className="text-gray-600">
                    Aplikasi ini digunakan untuk memonitor jadwal KGB dan Kenaikan Pangkat pegawai ASN di lingkungan BNN Kota Bandung.
                  </p>
                  <ul className="list-disc list-inside mt-4 text-sm text-gray-700">
                    <li>Lihat notifikasi penting dalam menu Notifikasi</li>
                    <li>Input dan perbarui data ASN secara berkala</li>
                    <li>Lihat dan kelola data dalam tabel ASN</li>
                  </ul>
                </Card>

                {notifPangkatList.length > 0 && (
                  <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4">
                    <p className="font-semibold">Notifikasi Kenaikan Pangkat:</p>
                    <ul className="list-disc list-inside">
                      {notifPangkatList.map((item, idx) => (
                        <li key={idx}>
                          {item.nama} - Jadwal Kenaikan Pangkat: {item.jadwalKenaikanPangkatBerikutnya}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {notifList.length > 0 && (
                  <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
                    <p className="font-semibold">Notifikasi KGB:</p>
                    <ul className="list-disc list-inside">
                      {notifList.map((item, idx) => (
                        <li key={idx}>
                          {item.nama} - Jadwal Kenaikan Gaji Berikutnya: {item.jadwalKgbBerikutnya}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="notifikasi">
                $1Monitoring Kenaikan Pangkat dan Gaji$2
                

                {notifPangkatList.length > 0 && (
                  <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mt-4">
                    <p className="font-semibold">Notifikasi Kenaikan Pangkat:</p>
                    <ul className="list-disc list-inside">
                      {notifPangkatList.map((item, idx) => (
                        <li key={idx}>
                          {item.nama} - Jadwal Kenaikan Pangkat: {item.jadwalKenaikanPangkatBerikutnya}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {notifList.length > 0 && (
                  <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mt-4">
                    <p className="font-semibold">Notifikasi Kenaikan Gaji:</p>
                    <ul className="list-disc list-inside">
                      {notifList.map((item, idx) => (
                        <li key={idx}>
                          {item.nama} - Jadwal Kenaikan Gaji Berikutnya: {item.jadwalKgbBerikutnya}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="input">
                <Card className="shadow-lg rounded-xl border border-blue-200 bg-white">
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    {Object.keys(asn).map((field) => (
                      <div key={field}>
                        <Label className="capitalize">{field.replace(/([A-Z])/g, ' $1')}</Label>
                        <Input
                          name={field}
                          type={['tmtPns','riwayatTmtKgb','riwayatTmtPangkat','jadwalKgbBerikutnya','jadwalKenaikanPangkatBerikutnya'].includes(field) ? 'date' : 'text'}
                          value={asn[field]}
                          onChange={handleChange}
                          readOnly={['jadwalKgbBerikutnya'].includes(field)}
                        />
                      </div>
                    ))}
                    <div className="md:col-span-2">
                      <Button onClick={handleSubmit}>Simpan Data</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tabel">
  <Card className="shadow-lg rounded-xl border border-blue-200 bg-white">
    <CardContent className="p-4 overflow-auto">
      
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm table-auto">
          <thead>
            <tr className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900">
              <th className="border px-2 py-2 text-left">Aksi</th>
              {Object.keys(asn).map((head) => (
                <th key={head} className="border px-2 py-2 text-left capitalize">
                  {head.replace(/([A-Z])/g, ' $1')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={Object.keys(asn).length + 1} className="text-center py-4 text-gray-500">
                  Belum ada data ASN.
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr key={idx} className="hover:bg-blue-50 transition">
                  <td className="border px-2 py-1 text-blue-600 underline cursor-pointer" onClick={() => {
                    setAsn(item);
                    setEditIndex(idx);
                  }}>
                    Edit
                  </td>
                  {Object.keys(asn).map((key) => (
                    <td key={key} className="border px-2 py-1">
                      {item[key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
</TabsContent>
            </div>
          </div>
        <audio ref={notifSound} src="/notif.mp3" preload="auto" />
        </Tabs>
      </div>
    </div>
  );
}
