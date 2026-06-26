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

export async function getTodos(params?: {
  statusFilter?: StatusFilter;
  priorityFilter?: PriorityFilter;
}): Promise<Todo[]> {
  const query = new URLSearchParams();
  if (params?.statusFilter === 'active') query.set('completed', 'false');
  else if (params?.statusFilter === 'completed') query.set('completed', 'true');
  if (params?.priorityFilter && params.priorityFilter !== 'all') {
    query.set('priority', params.priorityFilter);
  }
  const qs = query.toString();
  const res = await fetch(`${BASE_URL}/todos${qs ? `?${qs}` : ''}`);
  return handleResponse<Todo[]>(res);
}

export async function getTodoById(id: string): Promise<Todo> {
  const res = await fetch(`${BASE_URL}/todos/${id}`);
  return handleResponse<Todo>(res);
}

export async function createTodo(data: CreateTodoRequest): Promise<Todo> {
  const res = await fetch(`${BASE_URL}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Todo>(res);
}

export async function updateTodo(id: string, data: UpdateTodoRequest): Promise<Todo> {
  const res = await fetch(`${BASE_URL}/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Todo>(res);
}

export async function completeTodo(id: string): Promise<Todo> {
  const res = await fetch(`${BASE_URL}/todos/${id}/complete`, {
    method: 'PATCH',
  });
  return handleResponse<Todo>(res);
}

export async function uncompleteTodo(id: string): Promise<Todo> {
  const res = await fetch(`${BASE_URL}/todos/${id}/uncomplete`, {
    method: 'PATCH',
  });
  return handleResponse<Todo>(res);
}

export async function deleteTodo(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/todos/${id}`, {
    method: 'DELETE',
  });
  return handleResponse<void>(res);
}
