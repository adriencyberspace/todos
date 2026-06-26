import type { Todo, CreateTodoRequest, UpdateTodoRequest, StatusFilter, PriorityFilter } from '../types/todo';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

function jsonInit(method: string, body: unknown): RequestInit {
  return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  return handleResponse<T>(await fetch(`${BASE_URL}${path}`, init));
}

export function getTodos(params?: { statusFilter?: StatusFilter; priorityFilter?: PriorityFilter }): Promise<Todo[]> {
  const query = new URLSearchParams();
  if (params?.statusFilter === 'active') query.set('completed', 'false');
  else if (params?.statusFilter === 'completed') query.set('completed', 'true');
  if (params?.priorityFilter && params.priorityFilter !== 'all') query.set('priority', params.priorityFilter);
  const qs = query.toString();
  return request<Todo[]>(`/todos${qs ? `?${qs}` : ''}`);
}

export const getTodoById  = (id: string)                        => request<Todo>(`/todos/${id}`);
export const createTodo   = (data: CreateTodoRequest)           => request<Todo>('/todos', jsonInit('POST', data));
export const updateTodo   = (id: string, data: UpdateTodoRequest) => request<Todo>(`/todos/${id}`, jsonInit('PUT', data));
export const completeTodo   = (id: string) => request<Todo>(`/todos/${id}/complete`, { method: 'PATCH' });
export const uncompleteTodo = (id: string) => request<Todo>(`/todos/${id}/uncomplete`, { method: 'PATCH' });
export const deleteTodo     = (id: string) => request<void>(`/todos/${id}`, { method: 'DELETE' });
