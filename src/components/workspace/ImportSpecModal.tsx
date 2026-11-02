import React, { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { parseOpenApi } from '@/utils/openapi';
import { CheckCircle2, AlertCircle, FileCode2 } from 'lucide-react';

interface ImportSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (projectId: string) => void;
}

export const ImportSpecModal: React.FC<ImportSpecModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [specContent, setSpecContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const parseResult = specContent.trim() ? parseOpenApi(specContent) : null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error(
        'Project Name Required',
        'Please enter a name for this API project.'
      );
      return;
    }

    if (!specContent.trim()) {
      toast.error(
        'Specification Required',
        'Please provide OpenAPI YAML or JSON content.'
      );
      return;
    }

    if (parseResult && !parseResult.success) {
      toast.error(
        'Specification Invalid',
        'Please fix the parsing errors before importing.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          specContent: specContent.trim(),
          specFormat: parseResult?.format || 'auto',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save project');
      }

      toast.success(
        'Project Imported',
        `Successfully created ${name.trim()} with ${data.data.endpointsCount} endpoints.`
      );
      onClose();
      if (onSuccess) {
        onSuccess(data.data.id);
      } else {
        window.location.href = `/workspace/${data.data.id}`;
      }
    } catch (err) {
      toast.error(
        'Import Failed',
        err instanceof Error ? err.message : 'Unknown error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Import OpenAPI Specification"
      description="Upload or paste an OpenAPI (3.0 / 3.1) or Swagger 2.0 definition in YAML or JSON."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Project Name *"
          placeholder="e.g. Payments Gateway API"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Description (Optional)"
          placeholder="Brief description of the API service and version"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              OpenAPI Specification (YAML or JSON) *
            </label>
            {parseResult && (
              <div className="flex items-center gap-2">
                <Badge variant={parseResult.success ? 'success' : 'danger'}>
                  {parseResult.format.toUpperCase()}
                </Badge>
                {parseResult.spec && (
                  <Badge variant="outline">
                    {parseResult.spec.endpointsCount} endpoints
                  </Badge>
                )}
              </div>
            )}
          </div>
          <Textarea
            rows={10}
            placeholder="Paste your openapi: 3.0.0 YAML or JSON specification here..."
            value={specContent}
            onChange={(e) => setSpecContent(e.target.value)}
            className="font-mono text-xs"
            required
          />
        </div>

        {/* Real-time validation feedback */}
        {parseResult && (
          <div className="p-3.5 rounded-xl bg-[#0A101D] border border-[#224870] space-y-2">
            <div className="flex items-center gap-2">
              {parseResult.success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#44CFCB] shrink-0" />
                  <span className="text-xs font-medium text-[#44CFCB]">
                    Valid{' '}
                    {parseResult.spec?.specType.replace('_', ' ').toUpperCase()}{' '}
                    Specification
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="text-xs font-medium text-rose-300">
                    Syntax / Parsing Issues Detected
                  </span>
                </>
              )}
            </div>

            {parseResult.issues.length > 0 && (
              <ul className="text-[11px] space-y-1 pl-6 list-disc text-[#9BB0CC]">
                {parseResult.issues.map((issue, idx) => (
                  <li
                    key={idx}
                    className={
                      issue.severity === 'error'
                        ? 'text-rose-400'
                        : issue.severity === 'warning'
                          ? 'text-amber-400'
                          : 'text-[#9BB0CC]'
                    }
                  >
                    {issue.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#224870]/60">
          <Button
            type="button"
            variant="danger"
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer"
          >
            Close
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={!specContent.trim() || !name.trim()}
            className="cursor-pointer"
          >
            <FileCode2 className="w-4 h-4" />
            <span>Create & Explore API</span>
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
