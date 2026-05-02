import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTodoStore, Todo, TodoPriority } from '@/src/store/useTodoStore';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useTranslation } from '@/src/hooks/useTranslation';


// ── Sabitler ──────────────────────────────────────────────────────────────────
const PRIORITY_CONFIG = (i18n: any): Record<TodoPriority, { label: string; color: string; bg: string }> => ({
  high:   { label: i18n.priorityHigh, color: '#f87171', bg: 'rgba(239,68,68,0.18)' },
  normal: { label: i18n.priorityNormal, color: '#a78bfa', bg: 'rgba(139,92,246,0.18)' },
  low:    { label: i18n.priorityLow, color: '#6ee7b7', bg: 'rgba(52,211,153,0.15)' },
});

// ── Yardımcı ──────────────────────────────────────────────────────────────────
function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
}

// ── Todo Satırı ───────────────────────────────────────────────────────────────
function TodoRow({
  todo,
  onToggle,
  onDelete,
  onEdit,
}: {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const i18n = useTranslation();
  const p = PRIORITY_CONFIG(i18n)[todo.priority];
  return (
    <View style={[styles.row, todo.completed && styles.rowDone]}>
      {/* Sol — öncelik şeridi */}
      <View style={[styles.priorityBar, { backgroundColor: p.color }]} />

      {/* Checkbox */}
      <TouchableOpacity style={styles.checkbox} onPress={onToggle} activeOpacity={0.7}>
        <LinearGradient
          colors={todo.completed ? ['#7c3aed', '#4c1d95'] : ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']}
          style={styles.checkboxInner}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          {todo.completed && <Ionicons name="checkmark" size={14} color="#fff" />}
        </LinearGradient>
      </TouchableOpacity>

      {/* Metin + tarih */}
      <View style={styles.textWrap}>
        <Text style={[styles.todoText, todo.completed && styles.todoTextDone]} numberOfLines={3}>
          {todo.text}
        </Text>
        <View style={styles.metaRow}>
          <View style={[styles.priorityChip, { backgroundColor: p.bg }]}>
            <Text style={[styles.priorityChipText, { color: p.color }]}>{p.label}</Text>
          </View>
          <Text style={styles.dateText}>{formatDate(todo.createdAt)}</Text>
        </View>
      </View>

      {/* Aksiyon butonları */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={onEdit} activeOpacity={0.7}>
          <Ionicons name="pencil" size={15} color="rgba(192,132,252,0.80)" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onDelete} activeOpacity={0.7}>
          <Ionicons name="trash-outline" size={15} color="rgba(248,113,113,0.80)" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Todo Ekle / Düzenle Modalı ────────────────────────────────────────────────
function EditModal({
  visible,
  initialText,
  initialPriority,
  onSave,
  onClose,
  isEdit,
}: {
  visible: boolean;
  initialText: string;
  initialPriority: TodoPriority;
  onSave: (text: string, priority: TodoPriority) => void;
  onClose: () => void;
  isEdit: boolean;
}) {
  const i18n = useTranslation();
  const [text, setText] = useState(initialText);
  const [priority, setPriority] = useState<TodoPriority>(initialPriority);

  // Visible değişince sıfırla
  React.useEffect(() => {
    setText(initialText);
    setPriority(initialPriority);
  }, [visible, initialText, initialPriority]);

  const canSave = text.trim().length > 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
          {/* Blur efekti için arka plan */}
          <LinearGradient
            colors={['rgba(60,20,120,0.92)', 'rgba(15,8,50,0.96)']}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          />
          <View style={styles.modalBorder} />

          <View style={styles.handle} />

          <Text style={styles.modalTitle}>{isEdit ? i18n.editTask : i18n.newTask}</Text>

          {/* Metin girişi */}
          <TextInput
            style={styles.input}
            placeholder={i18n.taskPlaceholder}
            placeholderTextColor="rgba(255,255,255,0.30)"
            value={text}
            onChangeText={setText}
            multiline
            maxLength={300}
            autoFocus={!isEdit}
          />

          {/* Öncelik seçici */}
          <Text style={styles.priorityLabel}>{i18n.priorityLabel}</Text>
          <View style={styles.priorityRow}>
            {(Object.keys(PRIORITY_CONFIG(i18n)) as TodoPriority[]).map((p) => {
              const cfg = PRIORITY_CONFIG(i18n)[p];
              const active = priority === p;
              return (
                <TouchableOpacity
                  key={p}
                  style={[styles.priorityBtn, active && { backgroundColor: cfg.bg, borderColor: cfg.color }]}
                  onPress={() => setPriority(p)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.priorityBtnText, { color: active ? cfg.color : 'rgba(255,255,255,0.45)' }]}>
                    {cfg.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Kaydet */}
          <TouchableOpacity
            style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
            onPress={() => canSave && onSave(text, priority)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={canSave ? ['#9333ea', '#7c3aed', '#6d28d9'] : ['#333', '#222']}
              style={styles.saveBtnGrad}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
              <Ionicons name={isEdit ? 'checkmark-done' : 'add'} size={18} color="#fff" />
              <Text style={styles.saveBtnText}>{isEdit ? i18n.updateBtn : i18n.addBtn}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Ana Ekran ─────────────────────────────────────────────────────────────────
type Filter = 'all' | 'active' | 'done';

export default function TodosScreen() {
  const router = useRouter();
  const i18n = useTranslation();
  const { todos, addTodo, toggleTodo, deleteTodo, updateTodo, clearCompleted, loadTodos, isLoading } = useTodoStore();
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? '';

  // Firebase'den todoları yükle
  useEffect(() => {
    if (userId) {
      loadTodos(userId);
    }
  }, [userId]);

  const [filter, setFilter] = useState<Filter>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<Todo | null>(null);

  const filtered = useMemo(() => {
    const base = [...todos].sort((a, b) => {
      // Tamamlanmayanlar önce, sonra eklenme tarihine göre yeni → eski
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return b.createdAt.localeCompare(a.createdAt);
    });
    if (filter === 'active') return base.filter((t) => !t.completed);
    if (filter === 'done') return base.filter((t) => t.completed);
    return base;
  }, [todos, filter]);

  const activeCount = todos.filter((t) => !t.completed).length;
  const doneCount = todos.filter((t) => t.completed).length;

  const openAdd = () => {
    setEditTarget(null);
    setModalVisible(true);
  };

  const openEdit = (todo: Todo) => {
    setEditTarget(todo);
    setModalVisible(true);
  };

  const handleSave = (text: string, priority: TodoPriority) => {
    if (editTarget) {
      updateTodo(editTarget.id, text, priority);
    } else {
      addTodo(userId, text, priority);
    }
    setModalVisible(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert(i18n.deleteTaskTitle, i18n.deleteTaskConfirm, [
      { text: i18n.cancel, style: 'cancel' },
      { text: i18n.deleteLabel, style: 'destructive', onPress: () => deleteTodo(id) },
    ]);
  };

  const handleClearDone = () => {
    if (doneCount === 0) return;
    Alert.alert(i18n.clearDoneTitle, i18n.clearDoneConfirm.replace('%n', String(doneCount)), [
      { text: i18n.cancel, style: 'cancel' },
      { text: i18n.clearLabel, style: 'destructive', onPress: () => clearCompleted(userId) },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#1a0533', '#0d0225', '#060412']} style={StyleSheet.absoluteFillObject} />

      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={22} color="rgba(255,255,255,0.80)" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{i18n.todosTitle}</Text>
            <Text style={styles.headerSub}>
              {i18n.todoStatus.replace('%a', String(activeCount)).replace('%d', String(doneCount))}
            </Text>
          </View>
          <TouchableOpacity style={styles.clearBtn} onPress={handleClearDone} activeOpacity={0.7}>
            <Ionicons name="checkmark-done-circle-outline" size={22} color={doneCount > 0 ? 'rgba(192,132,252,0.85)' : 'rgba(255,255,255,0.20)'} />
          </TouchableOpacity>
        </View>

        {/* Filtreler */}
        <View style={styles.filterRow}>
          {(['all', 'active', 'done'] as Filter[]).map((f) => {
            const labels: Record<Filter, string> = { all: i18n.allNotes, active: i18n.activeFilter, done: i18n.doneFilter };
            const active = filter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.filterBtn, active && styles.filterBtnActive]}
                onPress={() => setFilter(f)}
                activeOpacity={0.75}
              >
                {active && (
                  <LinearGradient
                    colors={['rgba(124,58,237,0.55)', 'rgba(109,40,217,0.35)']}
                    style={StyleSheet.absoluteFillObject}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  />
                )}
                <Text style={[styles.filterBtnText, active && styles.filterBtnTextActive]}>
                  {labels[f]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Liste */}
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.emptyWrap}>
              <ActivityIndicator size="large" color="rgba(192,132,252,0.85)" />
              <Text style={styles.emptyText}>{i18n.loadingTasks}</Text>
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="clipboard-outline" size={52} color="rgba(255,255,255,0.15)" />
              <Text style={styles.emptyText}>
                {filter === 'done' ? i18n.noDoneTasks :
                 filter === 'active' ? i18n.noActiveTasks :
                 i18n.emptyTodoList}
              </Text>
            </View>
          ) : (
            filtered.map((todo) => (
              <TodoRow
                key={todo.id}
                todo={todo}
                onToggle={() => toggleTodo(todo.id)}
                onDelete={() => handleDelete(todo.id)}
                onEdit={() => openEdit(todo)}
              />
            ))
          )}
          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={openAdd} activeOpacity={0.85}>
        <LinearGradient
          colors={['#9333ea', '#7c3aed', '#6d28d9']}
          style={styles.fabGrad}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Modal */}
      <EditModal
        visible={modalVisible}
        initialText={editTarget?.text ?? ''}
        initialPriority={editTarget?.priority ?? 'normal'}
        isEdit={editTarget !== null}
        onSave={handleSave}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

// ── Stiller ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36, height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: {
    fontSize: 20, fontWeight: '700',
    color: 'rgba(255,255,255,0.95)',
    fontFamily: 'InriaSerif_700Bold',
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.40)',
    marginTop: 2,
  },
  clearBtn: {
    width: 36, height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Filtreler
  filterRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    overflow: 'hidden',
  },
  filterBtnActive: {
    borderWidth: 1,
    borderColor: 'rgba(192,132,252,0.35)',
  },
  filterBtnText: {
    fontSize: 11, fontWeight: '600',
    color: 'rgba(255,255,255,0.40)',
  },
  filterBtnTextActive: { color: 'rgba(192,132,252,0.95)' },

  // Liste
  list: { flex: 1 },
  listContent: { paddingHorizontal: 16, gap: 10, paddingTop: 2 },

  // Boş durum
  emptyWrap: { alignItems: 'center', paddingTop: 80, gap: 16 },
  emptyText: {
    fontSize: 14, color: 'rgba(255,255,255,0.30)',
    textAlign: 'center', lineHeight: 20,
  },

  // Todo satırı
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
    minHeight: 66,
    gap: 10,
    paddingRight: 10,
  },
  rowDone: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.05)',
  },
  priorityBar: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
    marginLeft: 0,
  },
  checkbox: { padding: 4 },
  checkboxInner: {
    width: 24, height: 24, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.20)',
  },
  textWrap: { flex: 1, paddingVertical: 12 },
  todoText: {
    fontSize: 14, fontWeight: '500',
    color: 'rgba(255,255,255,0.88)',
    lineHeight: 20,
  },
  todoTextDone: {
    color: 'rgba(255,255,255,0.30)',
    textDecorationLine: 'line-through',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  priorityChip: {
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 6,
  },
  priorityChipText: {
    fontSize: 10, fontWeight: '700', letterSpacing: 0.3,
  },
  dateText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.28)',
  },
  actions: { flexDirection: 'column', gap: 6 },
  actionBtn: {
    width: 30, height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    shadowColor: '#6d28d9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 12,
  },
  fabGrad: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(192,132,252,0.35)',
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.60)',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  modalSheet: {
    borderRadius: 28,
    overflow: 'hidden',
    paddingBottom: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(168,85,247,0.45)',
  },
  modalBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(192,132,252,0.20)',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignSelf: 'center', marginTop: 12, marginBottom: 14,
  },
  modalTitle: {
    textAlign: 'center', fontSize: 18, fontWeight: '700',
    color: 'rgba(255,255,255,0.90)', letterSpacing: 0.5,
    fontFamily: 'InriaSerif_700Bold',
    marginBottom: 20,
  },
  input: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    padding: 14,
    color: 'rgba(255,255,255,0.90)',
    fontSize: 15,
    lineHeight: 22,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  priorityLabel: {
    marginHorizontal: 20,
    fontSize: 12, fontWeight: '600',
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  priorityRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    gap: 8,
    marginBottom: 24,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  priorityBtnText: { fontSize: 12, fontWeight: '700' },
  saveBtn: { marginHorizontal: 20, borderRadius: 14, overflow: 'hidden' },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
  },
  saveBtnText: {
    color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 0.3,
  },
});
