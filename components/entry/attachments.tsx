/**
 * Attachments on an entry — list, previews, drag and drop.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Platform, Pressable, View } from 'react-native';

import { Button, Icon, Row, Text } from '@/components/ui';
import { ATTACHMENTS_ENABLED } from '@/config/features';
import { useAttachments, type UploadTask } from '@/contexts/attachments-context';
import { useTheme } from '@/hooks/use-theme';
import {
  driveService,
  formatBytes,
  iconForType,
  isPreviewable,
  type Attachment,
} from '@/services/drive-service';
import { showAlert, showSimpleAlert } from '@/utils/alert';
import { openUrl } from '@/utils/url-utils';

/** Thumbnail for an image attachment, fetched through the authenticated proxy. */
function Thumbnail({ attachment }: { attachment: Attachment }) {
  const t = useTheme();
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let revoked = false;
    let objectUrl: string | null = null;

    driveService
      .previewUrl(attachment.id)
      .then((next) => {
        if (revoked) {
          URL.revokeObjectURL(next);
          return;
        }
        objectUrl = next;
        setUrl(next);
      })
      .catch(() => setFailed(true));

    return () => {
      revoked = true;
      // The object URL holds the blob in memory until it is released.
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [attachment.id]);

  const box = {
    width: 40,
    height: 40,
    borderRadius: t.radius.sm,
    backgroundColor: t.colors.sunken,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    overflow: 'hidden' as const,
  };

  if (failed || !url) {
    return (
      <View style={box}>
        {failed ? (
          <Icon name={iconForType(attachment.mimeType) as any} size="md" tone="faint" />
        ) : (
          <ActivityIndicator size="small" color={t.colors.inkFaint} />
        )}
      </View>
    );
  }

  return (
    <View style={box}>
      <Image source={{ uri: url }} style={{ width: 40, height: 40 }} resizeMode="cover" />
    </View>
  );
}

function AttachmentRow({
  attachment,
  onRemove,
  editable,
}: {
  attachment: Attachment;
  onRemove: (a: Attachment) => void;
  editable: boolean;
}) {
  const t = useTheme();
  const [hovered, setHovered] = useState(false);

  return (
    <View
      // @ts-expect-error RN-Web hover props
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`Open ${attachment.name} in Drive`}
        onPress={() => attachment.webViewLink && openUrl(attachment.webViewLink)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: t.space.md,
          paddingVertical: t.space.sm,
          paddingHorizontal: t.space.sm,
          marginHorizontal: -t.space.sm,
          borderRadius: t.radius.sm,
          backgroundColor: hovered ? t.colors.wash : 'transparent',
          ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
        }}
      >
        {isPreviewable(attachment) ? (
          <Thumbnail attachment={attachment} />
        ) : (
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: t.radius.sm,
              backgroundColor: t.colors.sunken,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name={iconForType(attachment.mimeType) as any} size="md" tone="faint" />
          </View>
        )}

        <View style={{ flex: 1, minWidth: 0 }}>
          <Text variant="ui" numberOfLines={1}>
            {attachment.name}
          </Text>
          <Text variant="uiSmall" tone="faint">
            {formatBytes(attachment.size)}
          </Text>
        </View>

        {editable && (hovered || Platform.OS !== 'web') && (
          <Button
            variant="ghost"
            size="sm"
            icon="close"
            onPress={() => onRemove(attachment)}
            accessibilityLabel={`Remove ${attachment.name}`}
          />
        )}
      </Pressable>
    </View>
  );
}

function UploadRow({ task, onDismiss }: { task: UploadTask; onDismiss: (key: string) => void }) {
  const t = useTheme();

  return (
    <Row gap="md" align="center" style={{ paddingVertical: t.space.sm }}>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: t.radius.sm,
          backgroundColor: task.error ? t.colors.dangerSoft : t.colors.sunken,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {task.error ? (
          <Icon name="error-outline" size="md" tone="danger" />
        ) : (
          <ActivityIndicator size="small" color={t.colors.inkFaint} />
        )}
      </View>

      <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
        <Text variant="ui" numberOfLines={1}>
          {task.name}
        </Text>
        {task.error ? (
          <Text variant="uiSmall" tone="danger" numberOfLines={2}>
            {task.error}
          </Text>
        ) : (
          <View
            style={{
              height: 3,
              borderRadius: 1,
              backgroundColor: t.colors.sunken,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: '100%',
                width: `${Math.round(task.progress * 100)}%`,
                backgroundColor: t.colors.accent,
              }}
            />
          </View>
        )}
      </View>

      {task.error && (
        <Button
          variant="ghost"
          size="sm"
          icon="close"
          onPress={() => onDismiss(task.key)}
          accessibilityLabel="Dismiss"
        />
      )}
    </Row>
  );
}

interface AttachmentsProps {
  entryId: string;
  /** Uploading and removing are only offered in write mode. */
  editable: boolean;
}

export function Attachments({ entryId, editable }: AttachmentsProps) {
  const t = useTheme();
  const { forEntry, uploadsFor, upload, remove, error, loading, ready } = useAttachments();
  const [dragging, setDragging] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const input = useRef<any>(null);

  const files = forEntry(entryId);
  const tasks = uploadsFor(entryId).filter((task) => !dismissed.includes(task.key));

  const send = useCallback(
    (list: File[]) => {
      if (list.length) void upload(entryId, list);
    },
    [entryId, upload]
  );

  /*
   * Drag and drop, web only. Bound imperatively because React Native's View
   * does not forward drag events, and every dragover must be default-prevented
   * or the browser navigates away to the dropped file.
   */
  const dropRef = useCallback(
    (node: any) => {
      if (Platform.OS !== 'web' || !node || !editable) return;

      let depth = 0;
      const over = (e: DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
      };
      const enter = (e: DragEvent) => {
        e.preventDefault();
        depth += 1;
        setDragging(true);
      };
      const leave = () => {
        // Entering a child fires leave on the parent, so count depth rather
        // than clearing on the first leave.
        depth = Math.max(0, depth - 1);
        if (depth === 0) setDragging(false);
      };
      const drop = (e: DragEvent) => {
        e.preventDefault();
        depth = 0;
        setDragging(false);
        send(Array.from(e.dataTransfer?.files ?? []));
      };

      node.addEventListener('dragover', over);
      node.addEventListener('dragenter', enter);
      node.addEventListener('dragleave', leave);
      node.addEventListener('drop', drop);
    },
    [editable, send]
  );

  const confirmRemove = (attachment: Attachment) => {
    showAlert('Remove this attachment?', `${attachment.name} will be moved to your Drive bin.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          remove(attachment).catch((e: any) =>
            showSimpleAlert('Could not remove', e?.message ?? 'The attachment is still there.')
          );
        },
      },
    ]);
  };

  // Held back while Drive authorisation is expired: the section is hidden
  // outright rather than left showing an error under every entry.
  if (!ATTACHMENTS_ENABLED) return null;

  const nothingToShow = files.length === 0 && tasks.length === 0;
  if (!editable && nothingToShow) return null;

  return (
    <View
      ref={dropRef}
      style={{
        marginTop: t.space.lg,
        paddingTop: t.space.lg,
        borderTopWidth: 1,
        borderTopColor: t.colors.hairline,
      }}
    >
      <Row gap="sm" align="center" style={{ marginBottom: t.space.sm }}>
        <Text variant="label" tone="faint">
          Attachments
        </Text>
        {files.length > 0 && (
          <Text variant="uiSmall" tone="faint">
            {files.length}
          </Text>
        )}
        <View style={{ flex: 1 }} />
        {editable && Platform.OS === 'web' && (
          <Button
            variant="ghost"
            size="sm"
            icon="attach-file"
            label="Add files"
            onPress={() => input.current?.click()}
          />
        )}
      </Row>

      {error && (
        <Text variant="uiSmall" tone="danger" style={{ marginBottom: t.space.sm }}>
          {error}
        </Text>
      )}

      {loading && !ready && (
        <Text variant="uiSmall" tone="faint">
          Checking Drive…
        </Text>
      )}

      {files.map((file) => (
        <AttachmentRow
          key={file.id}
          attachment={file}
          onRemove={confirmRemove}
          editable={editable}
        />
      ))}

      {tasks.map((task) => (
        <UploadRow
          key={task.key}
          task={task}
          onDismiss={(key) => setDismissed((prev) => [...prev, key])}
        />
      ))}

      {editable && (
        <View
          style={{
            marginTop: t.space.sm,
            paddingVertical: t.space.lg,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: dragging ? t.colors.accent : t.colors.hairline,
            borderRadius: t.radius.md,
            backgroundColor: dragging ? t.colors.accentSoft : 'transparent',
            alignItems: 'center',
          }}
          pointerEvents="none"
        >
          <Text variant="uiSmall" tone={dragging ? 'accent' : 'faint'}>
            {dragging
              ? 'Drop to attach'
              : Platform.OS === 'web'
                ? 'Drop files here, or use Add files'
                : 'Attachments can be added from the web app'}
          </Text>
        </View>
      )}

      {/*
        A real file input, hidden. RN Web has no file picker, and this is the
        only way to open the OS dialog from a button.
      */}
      {editable && Platform.OS === 'web' && (
        <input
          ref={input}
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={(e: any) => {
            send(Array.from(e.target.files ?? []));
            e.target.value = '';
          }}
        />
      )}
    </View>
  );
}
