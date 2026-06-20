"use client";

import { BedDouble, Clock3, ImageIcon, Moon, Pencil, Plus, Trash2, Users, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { OvernightOption, Room } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const defaultOvernightOptions: OvernightOption[] = [
  {
    id: "on-1",
    labelEn: "Late Overnight (22:30 - 08:00)",
    labelVi: "Qua đêm muộn (22:30 - 08:00)",
    checkInTime: "22:30",
    checkOutTime: "08:00",
    price: 1750000,
  },
  {
    id: "on-2",
    labelEn: "Standard Overnight (22:00 - 10:00)",
    labelVi: "Qua đêm thường (22:00 - 10:00)",
    checkInTime: "22:00",
    checkOutTime: "10:00",
    price: 2125000,
  },
];

const emptyRoom: Omit<Room, "id"> = {
  name: "",
  description: "",
  guests: 2,
  beds: "1 queen bed",
  size: "30 m²",
  hourlyPrice: 450000,
  overnightPrice: 1225000,
  dailyPrice: 2000000,
  hourlyBlockHours: 3,
  hourlyBlockPrice: 1250000,
  hourlyExtraHourPrice: 375000,
  overnightOptions: defaultOvernightOptions,
  minHours: 2,
  maxHours: 12,
  price: 2000000,
  image: "",
  gallery: [],
  remaining: 1,
};

export function RoomManager({
  homestayId,
  initialRooms,
}: {
  homestayId: string;
  initialRooms: Room[];
}) {
  const [rooms, setRooms] = useState(initialRooms);
  const [editing, setEditing] = useState<Room | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);

    const image = String(form.get("image") ?? "").trim();
    const gallery = Array.from(
      new Set(
        [
          image,
          ...String(form.get("gallery") ?? "")
            .split(/\r?\n/)
            .map((url) => url.trim()),
        ].filter(Boolean),
      ),
    );

    const hourlyBlockHours = Number(form.get("hourlyBlockHours"));
    const hourlyBlockPrice = Number(form.get("hourlyBlockPrice"));
    const overnightOptions = buildOvernightOptions(form);

    const payload = {
      name: form.get("name"),
      description: form.get("description"),
      guests: Number(form.get("guests")),
      beds: form.get("beds"),
      size: form.get("size"),
      hourlyPrice: Math.round(hourlyBlockPrice / hourlyBlockHours),
      overnightPrice: overnightOptions[0]?.price || 1225000,
      dailyPrice: Number(form.get("dailyPrice")),
      hourlyBlockHours,
      hourlyBlockPrice,
      hourlyExtraHourPrice: Number(form.get("hourlyExtraHourPrice")),
      overnightOptions,
      minHours: Number(form.get("minHours")),
      maxHours: Number(form.get("maxHours")),
      price: Number(form.get("dailyPrice")),
      image,
      gallery,
      remaining: Number(form.get("remaining")),
    };

    const response = await fetch(
      editing
        ? `/api/homestays/${homestayId}/rooms/${editing.id}`
        : `/api/homestays/${homestayId}/rooms`,
      {
        method: editing ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const result = (await response.json()) as Room & { error?: string };
    setSaving(false);
    if (!response.ok) {
      setError(result.error ?? "Không thể lưu phòng.");
      return;
    }
    setRooms((current) =>
      editing
        ? current.map((room) => (room.id === editing.id ? result : room))
        : [...current, result],
    );
    setEditing(null);
    setAdding(false);
  }

  async function remove(room: Room) {
    if (!window.confirm(`Xóa ${room.name}?`)) return;
    const response = await fetch(`/api/homestays/${homestayId}/rooms/${room.id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setRooms((current) => current.filter((item) => item.id !== room.id));
      return;
    }
    setError("Mỗi cơ sở phải giữ ít nhất một phòng.");
  }

  const formRoom = editing ?? emptyRoom;
  const activeOptions = [...formRoom.overnightOptions, ...defaultOvernightOptions].slice(0, 2);

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold">Phòng</h2>
          <p className="mt-1 text-sm text-muted-foreground">Quản lý loại phòng, hình ảnh, giá và gói qua đêm.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { setAdding(true); setEditing(null); }}>
          <Plus className="size-4" /> Thêm phòng
        </Button>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        {rooms.map((room) => (
          <Card key={room.id} className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-muted text-primary">
                <BedDouble className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{room.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{room.description}</p>
                  </div>
                  <p className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                    Còn {room.remaining}
                  </p>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                  <RoomFact icon={Users} value={`${room.guests} khách`} />
                  <RoomFact icon={Clock3} value={`${formatCurrency(room.hourlyBlockPrice)}/${room.hourlyBlockHours}h`} />
                  <RoomFact icon={Moon} value={`${room.overnightOptions?.length || 0} gói qua đêm`} />
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => { setEditing(room); setAdding(false); }}>
                    <Pencil className="size-4" /> Sửa
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(room)}>
                    <Trash2 className="size-4" /> Xóa
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {adding || editing ? (
        <form key={editing?.id ?? "new-room"} onSubmit={submit} className="mt-5 grid gap-4">
          <Card className="p-5">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold">{editing ? "Sửa phòng" : "Phòng mới"}</h3>
                <p className="mt-1 text-sm text-muted-foreground">Nội dung hiển thị cho khách và sức chứa.</p>
              </div>
              <button type="button" aria-label="Đóng form phòng" onClick={() => { setAdding(false); setEditing(null); }} className="grid size-9 place-items-center rounded-full hover:bg-muted">
                <X className="size-4" />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tên phòng"><Input name="name" defaultValue={formRoom.name} required /></Field>
              <Field label="Giường"><Input name="beds" defaultValue={formRoom.beds} required /></Field>
              <Field label="Mô tả" className="sm:col-span-2"><Textarea name="description" defaultValue={formRoom.description} required rows={3} /></Field>
              <Field label="Diện tích"><Input name="size" defaultValue={formRoom.size} required /></Field>
              <Field label="Số khách"><Input name="guests" type="number" min="1" defaultValue={formRoom.guests} required /></Field>
            </div>
          </Card>

          <Card className="p-5">
            <SectionTitle icon={ImageIcon} title="Hình ảnh" description="Mỗi URL một dòng cho thư viện ảnh phòng." />
            <div className="grid gap-4">
              <Field label="URL ảnh chính"><Input name="image" type="url" defaultValue={formRoom.image} required /></Field>
              <Field label="URL thư viện ảnh"><Textarea name="gallery" rows={4} defaultValue={(formRoom.gallery?.length ? formRoom.gallery : [formRoom.image].filter(Boolean)).join("\n")} placeholder="Mỗi dòng một URL ảnh. Tối đa 12 ảnh." /></Field>
            </div>
          </Card>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card className="p-5">
              <SectionTitle icon={Clock3} title="Giá thuê ngắn giờ" description="Gói giờ đầu và giá giờ phát sinh dùng cho đơn đặt theo giờ." />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Số giờ gói đầu"><Input name="hourlyBlockHours" type="number" min="1" defaultValue={formRoom.hourlyBlockHours} required /></Field>
                <Field label="Giá gói đầu"><Input name="hourlyBlockPrice" type="number" min="1" defaultValue={formRoom.hourlyBlockPrice} required /></Field>
                <Field label="Giá thêm mỗi giờ"><Input name="hourlyExtraHourPrice" type="number" min="0" defaultValue={formRoom.hourlyExtraHourPrice} required /></Field>
                <Field label="Giá theo ngày"><Input name="dailyPrice" type="number" min="1" defaultValue={formRoom.dailyPrice} required /></Field>
                <Field label="Số giờ tối thiểu"><Input name="minHours" type="number" min="1" defaultValue={formRoom.minHours} required /></Field>
                <Field label="Số giờ tối đa"><Input name="maxHours" type="number" min="1" defaultValue={formRoom.maxHours} required /></Field>
              </div>
            </Card>

            <Card className="p-5">
              <SectionTitle icon={Users} title="Tồn phòng" description="Kiểm soát số phòng có thể bán cho loại phòng này." />
              <Field label="Số phòng còn bán"><Input name="remaining" type="number" min="0" defaultValue={formRoom.remaining} required /></Field>
            </Card>
          </div>

          <Card className="p-5">
            <SectionTitle icon={Moon} title="Gói qua đêm" description="Hai khung qua đêm phổ biến hiển thị cho khách bằng tiếng Anh và tiếng Việt." />
            <div className="grid gap-4 xl:grid-cols-2">
              {activeOptions.map((option, index) => (
                <div key={`${option.id}-${index}`} className="rounded-[var(--radius-md)] border border-border bg-background p-4">
                  <p className="text-sm font-semibold">Gói {index + 1}</p>
                  <input type="hidden" name={`overnight.${index}.id`} defaultValue={option.id || `on-${index + 1}`} />
                  <div className="mt-4 grid gap-3">
                    <Field label="Nhãn tiếng Anh"><Input name={`overnight.${index}.labelEn`} defaultValue={option.labelEn} required /></Field>
                    <Field label="Nhãn tiếng Việt"><Input name={`overnight.${index}.labelVi`} defaultValue={option.labelVi} required /></Field>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Field label="Giờ nhận"><Input name={`overnight.${index}.checkInTime`} type="time" defaultValue={option.checkInTime} required /></Field>
                      <Field label="Giờ trả"><Input name={`overnight.${index}.checkOutTime`} type="time" defaultValue={option.checkOutTime} required /></Field>
                      <Field label="Giá"><Input name={`overnight.${index}.price`} type="number" min="1" defaultValue={option.price} required /></Field>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
          <div className="sticky bottom-4 z-10 flex rounded-[var(--radius-lg)] bg-background/90 py-2 backdrop-blur">
            <Button type="submit" disabled={saving}>{saving ? "Đang lưu..." : "Lưu phòng"}</Button>
          </div>
        </form>
      ) : error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
    </section>
  );
}

function buildOvernightOptions(form: FormData): OvernightOption[] {
  return [0, 1].map((index) => ({
    id: String(form.get(`overnight.${index}.id`) ?? `on-${index + 1}`),
    labelEn: String(form.get(`overnight.${index}.labelEn`) ?? ""),
    labelVi: String(form.get(`overnight.${index}.labelVi`) ?? ""),
    checkInTime: String(form.get(`overnight.${index}.checkInTime`) ?? ""),
    checkOutTime: String(form.get(`overnight.${index}.checkOutTime`) ?? ""),
    price: Number(form.get(`overnight.${index}.price`)),
  }));
}

function RoomFact({ icon: Icon, value }: { icon: typeof Users; value: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <Icon className="size-4" />
      {value}
    </span>
  );
}

function SectionTitle({ icon: Icon, title, description }: { icon: typeof Users; title: string; description: string }) {
  return (
    <div className="mb-5 flex gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-primary"><Icon className="size-4" /></span>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`text-sm font-semibold ${className ?? ""}`}>
      <span className="mb-2 block">{label}</span>
      {children}
    </label>
  );
}
