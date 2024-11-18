import React, { FormEvent, useState } from 'react';
import cn from 'classnames';
import { Todo } from '../types/Todo';

interface Props {
  todo: Todo;
  onRemoveTodo?: (todoId: number) => Promise<void>;
  onToggleTodoCompletion?: (todo: Todo) => void;
  onUpdateTodoTitle?: (todo: Todo) => Promise<string>;
  isLoading: boolean;
}

export const TodoItem: React.FC<Props> = ({
  todo,
  onRemoveTodo = () => {},
  onToggleTodoCompletion = () => {},
  onUpdateTodoTitle = () => Promise.resolve(''),
  isLoading,
}) => {
  const { id, title, completed } = todo;

  const [isEditingMode, setIsEditingMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);

  const handleEscapeKey = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Escape') {
      setIsEditingMode(false);
      setEditedTitle(title);
    }
  };

  const handleEditSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedEditedTitle = editedTitle.trim();

    // Якщо новий заголовок не змінився
    if (trimmedEditedTitle === todo.title) {
      setIsEditingMode(false);

      return;
    }

    // Якщо заголовок порожній, спробувати видалити туду
    if (!trimmedEditedTitle) {
      try {
        await onRemoveTodo(id); // Чекаємо завершення видалення
        setIsEditingMode(false); // Закриваємо режим редагування
      } catch (error) {
        // Якщо сталася помилка, не закриваємо форму редагування
      }

      return;
    }

    // Якщо заголовок оновлений
    try {
      await onUpdateTodoTitle({
        ...todo,
        title: trimmedEditedTitle,
      });

      setIsEditingMode(false); // Закриваємо режим редагування
    } catch (error) {
      // Якщо сталася помилка, залишаємо форму відкритою
      setIsEditingMode(true);
    }
  };

  return (
    <div data-cy="Todo" className={cn('todo', { completed: completed })}>
      {/* Label and Checkbox */}
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={completed}
          onChange={() => onToggleTodoCompletion(todo)}
        />
      </label>

      {/* Editing form or regular title display */}
      {isEditingMode ? (
        <form
          onSubmit={handleEditSubmit}
          onBlur={handleEditSubmit}
          onKeyUp={handleEscapeKey}
        >
          <input
            autoFocus
            data-cy="TodoTitleField"
            type="text"
            className="todo__title-field"
            placeholder="Empty todo will be deleted"
            value={editedTitle}
            onChange={event => setEditedTitle(event.target.value.trimStart())}
          />
        </form>
      ) : (
        <>
          <span
            data-cy="TodoTitle"
            className="todo__title"
            onDoubleClick={() => {
              setIsEditingMode(true);
              setEditedTitle(todo.title);
            }}
          >
            {title}
          </span>

          <button
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={() => onRemoveTodo(id)}
          >
            ×
          </button>
        </>
      )}

      {/* Loading overlay */}
      <div
        data-cy="TodoLoader"
        className={cn('modal overlay', { 'is-active': isLoading })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
