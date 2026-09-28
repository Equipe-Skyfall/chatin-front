"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { getAllUsers, criarUsuario, atualizarUsuario, excluirUsuario, type AdminUser } from "@/lib/users";
import { createUserSchema, editUserSchema, type CreateUserFormData, type EditUserFormData } from "@/lib/validation/users";
import { getFriendlyErrorMessage } from "@/lib/errorMessages";
import { ConfirmDialog } from "./confirm_dialog";

interface UsersManagementProps {
  currentUserId: string;
}

const PAGE_SIZE = 10;

export function UsersManagement({ currentUserId }: UsersManagementProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [creating, setCreating] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const carregarUsuarios = useCallback(async (paginaAlvo: number) => {
  setLoading(true);
  try {
    const data = await getAllUsers({ skip: paginaAlvo * PAGE_SIZE, take: PAGE_SIZE });
    setUsers(data);
  } catch (error) {
    toast.error(getFriendlyErrorMessage(error));
  } finally {
    setLoading(false);
  }
}, []);

    useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch ao montar/trocar de página
  carregarUsuarios(page);
}, [page, carregarUsuarios]);

  function handleDeleteClick(user: AdminUser) {
    if (user.id === currentUserId) {
      toast.error("Você não pode excluir sua própria conta por aqui.");
      return;
    }
    setUserToDelete(user);
  }

  async function handleConfirmDelete() {
    if (!userToDelete) return;

    setDeleting(true);
    try {
      await excluirUsuario(userToDelete.id);
      toast.success("Usuário excluído com sucesso.");
      setUserToDelete(null);
      await carregarUsuarios(page);
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#18202b]">Gerenciar Usuários</h3>
          <p className="mt-1 text-sm text-[#737a84]">Crie, edite ou remova contas de usuário.</p>
        </div>
        {!creating && !editingUser && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#fb7118] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-[#e9600c]"
          >
            <Plus size={14} /> Novo Usuário
          </button>
        )}
      </div>

      {creating && (
        <UserForm
          mode="create"
          onCancel={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            if (page === 0) void carregarUsuarios(0);
             else setPage(0);
          }}
        />
      )}

      {editingUser && (
        <UserForm
          mode="edit"
          user={editingUser}
          onCancel={() => setEditingUser(null)}
          onSaved={(user) => {
            setUsers((atual) => atual.map((u) => (u.id === user.id ? user : u)));
            setEditingUser(null);
          }}
        />
      )}

      {!creating && !editingUser && (
        <div className="mt-6 overflow-x-auto">
          {loading && <p className="text-sm text-[#737a84]">Carregando usuários...</p>}

          {!loading && users.length === 0 && (
            <p className="text-sm text-[#737a84]">Nenhum usuário encontrado.</p>
          )}

          {!loading && users.length > 0 && (
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#e5e7eb] text-[#8b929b]">
                  <th className="py-2 pr-4 font-medium">Usuário</th>
                  <th className="py-2 pr-4 font-medium">E-mail</th>
                  <th className="py-2 pr-4 font-medium">Função</th>
                  <th className="py-2 pr-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-[#f3f4f6] last:border-0">
                    <td className="py-3 pr-4 font-medium text-[#18202b]">{user.username}</td>
                    <td className="py-3 pr-4 text-[#4b5563]">{user.email}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={
                          user.role === "ADMIN"
                            ? "rounded-full bg-[#fef1e6] px-2.5 py-1 text-xs font-semibold text-[#fb7118]"
                            : "rounded-full bg-[#f3f4f6] px-2.5 py-1 text-xs font-medium text-[#6b7280]"
                        }
                      >
                        {user.role === "ADMIN" ? "Admin" : "Usuário"}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingUser(user)}
                          className="rounded-lg border border-[#e5e7eb] p-1.5 text-[#18202b] transition hover:bg-[#f9fafb]"
                          aria-label={`Editar ${user.username}`}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(user)}
                          disabled={user.id === currentUserId}
                          className="rounded-lg border border-red-200 p-1.5 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label={`Excluir ${user.username}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-[#8b929b]">Página {page + 1}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-sm font-medium text-[#18202b] transition hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={users.length < PAGE_SIZE}
                  className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-sm font-medium text-[#18202b] transition hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={userToDelete !== null}
        title="Excluir usuário"
        description={
          userToDelete
            ? `Tem certeza que deseja excluir "${userToDelete.username}"? Essa ação não pode ser desfeita.`
            : ""
        }
        confirmLabel="Excluir"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setUserToDelete(null)}
      />
    </div>
  );
}

interface UserFormProps {
  mode: "create" | "edit";
  user?: AdminUser;
  onCancel: () => void;
  onSaved: (user: AdminUser) => void;
}

function UserForm({ mode, user, onCancel, onSaved }: UserFormProps) {
  const [loading, setLoading] = useState(false);
  const schema = mode === "create" ? createUserSchema : editUserSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserFormData | EditUserFormData>({
    resolver: zodResolver(schema),
    defaultValues:
      mode === "edit" && user
        ? { username: user.username, email: user.email }
        : { role: "USER" },
  });

  async function onSubmit(data: CreateUserFormData | EditUserFormData) {
    setLoading(true);
    try {
      if (mode === "create") {
        const novo = await criarUsuario(data as CreateUserFormData);
        toast.success("Usuário criado com sucesso!");
        onSaved(novo);
      } else if (user) {
        const atualizado = await atualizarUsuario(user.id, data as EditUserFormData);
        toast.success("Usuário atualizado com sucesso!");
        onSaved(atualizado);
      }
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid max-w-md gap-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-[#18202b]">
          {mode === "create" ? "Novo usuário" : `Editar "${user?.username}"`}
        </h4>
        <button type="button" onClick={onCancel} className="text-[#8b929b] hover:text-[#18202b]">
          <X size={16} />
        </button>
      </div>

      <div className="grid gap-2">
        <label htmlFor="username" className="text-sm font-medium text-[#18202b]">
          Usuário
        </label>
        <input
          id="username"
          {...register("username")}
          className="h-11 rounded-lg border border-[#e1e5ea] px-3 text-sm outline-none focus:border-[#fb7118] focus:ring-4 focus:ring-[#fb7118]/10"
        />
        {errors.username && <p className="text-xs text-red-600">{errors.username.message}</p>}
      </div>

      <div className="grid gap-2">
        <label htmlFor="email" className="text-sm font-medium text-[#18202b]">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          className="h-11 rounded-lg border border-[#e1e5ea] px-3 text-sm outline-none focus:border-[#fb7118] focus:ring-4 focus:ring-[#fb7118]/10"
        />
        {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
      </div>

      {mode === "create" && (
        <div className="grid gap-2">
          <label htmlFor="password" className="text-sm font-medium text-[#18202b]">
            Senha
          </label>
          <input
            id="password"
            type="password"
            {...register("password" as const)}
            className="h-11 rounded-lg border border-[#e1e5ea] px-3 text-sm outline-none focus:border-[#fb7118] focus:ring-4 focus:ring-[#fb7118]/10"
          />
          {"password" in errors && errors.password && (
            <p className="text-xs text-red-600">{errors.password.message as string}</p>
          )}
        </div>
      )}

      {mode === "create" && (
        <div className="grid gap-2">
          <label htmlFor="role" className="text-sm font-medium text-[#18202b]">
            Função
          </label>
          <select
            id="role"
            {...register("role" as const)}
            className="h-11 rounded-lg border border-[#e1e5ea] bg-white px-3 text-sm outline-none focus:border-[#fb7118] focus:ring-4 focus:ring-[#fb7118]/10"
          >
            <option value="USER">Usuário</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[#fb7118] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#e9600c] disabled:opacity-60"
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-semibold text-[#18202b] transition hover:bg-[#f9fafb]"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}